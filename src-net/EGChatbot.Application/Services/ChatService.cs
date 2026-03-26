using System.Text;
using EGChatbot.Common.Models;
using EGChatbot.Application.Writers;
using EGChatbot.Domain.Data;
using EGChatbot.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace EGChatbot.Application.Services;

#pragma warning disable OPENAI001

/// <summary>
/// Azure AI Foundry agent service using v2 Agents API.
/// </summary>
/// <remarks>
/// Uses Microsoft.Agents.AI.AzureAI extension methods on AIProjectClient for agent loading,
/// and direct ProjectResponsesClient for streaming (required for annotations, MCP approvals).
/// See .github/skills/researching-azure-ai-sdk/SKILL.md for SDK patterns.
/// </remarks>
public class ChatService(
    ILogger<ChatService> _logger)
{

    private readonly ILogger<ChatService> logger = _logger;

    public static async Task StreamChatEndpointAsync(
        ChatRequest request,
                AgentFrameworkService agentService,
                ApplicationDbContext dbContext,
                HttpContext httpContext,
                IHostEnvironment environment,
                CancellationToken cancellationToken)
    {
        ChatConversation? chatConversation = null;
        try
        {
            if (string.IsNullOrWhiteSpace(request.SessionId))
            {
                await SSEEventWriters.WriteErrorEvent(
                    httpContext.Response,
                    "SessionId is required",
                    cancellationToken);
                return;
            }

            // Extract the user's JWT token from the Authorization header
            var authHeader = httpContext.Request.Headers["Authorization"].ToString();
            var userAccessToken = authHeader.Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase);

            if (string.IsNullOrEmpty(userAccessToken))
            {
                await SSEEventWriters.WriteErrorEvent(
                    httpContext.Response,
                    "Missing or invalid Authorization header",
                    cancellationToken);
                return;
            }

            var session = await dbContext.Sessions
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == request.SessionId, cancellationToken);

            if (session is null)
            {
                await SSEEventWriters.WriteErrorEvent(
                    httpContext.Response,
                    "Session was not found",
                    cancellationToken);
                return;
            }


            var conversationId = request.ConversationId
                ?? await agentService.CreateConversationAsync(request.Message, cancellationToken);

            var (conversation, isNewConversation) = await GetOrCreateConversationAsync(
                dbContext,
                request.SessionId,
                conversationId,
                request.Message,
                cancellationToken);
            chatConversation = conversation;

            var messageForAgent = isNewConversation
                ? PrefixFirstMessageWithUserName(request.Message, session.FirstName, session.LastName)
                : request.Message;

            await SaveMessageAsync(
                dbContext,
                chatConversation,
                role: "user",
                content: request.Message,
                status: "completed",
                durationMs: null,
                usage: null,
                cancellationToken);

            await SSEEventWriters.WriteConversationIdEvent(httpContext.Response, conversationId, cancellationToken);

            var startTime = DateTime.UtcNow;
            var assistantContent = new StringBuilder();

                await foreach (var chunk in agentService.StreamMessageAsync(conversationId, messageForAgent
    , cancellationToken: cancellationToken))
            {
                if (chunk.IsText && chunk.TextDelta != null)
                {
                    assistantContent.Append(chunk.TextDelta);
                    await SSEEventWriters.WriteChunkEvent(httpContext.Response, chunk.TextDelta, cancellationToken);
                }
                else if (chunk.HasAnnotations && chunk.Annotations != null)
                {
                    await SSEEventWriters.WriteAnnotationsEvent(httpContext.Response, chunk.Annotations, cancellationToken);
                }
                else if (chunk.IsMcpApprovalRequest && chunk.McpApprovalRequest != null)
                {
                    await SSEEventWriters.WriteMcpApprovalRequestEvent(httpContext.Response, chunk.McpApprovalRequest, cancellationToken);
                }
            }

            var duration = (DateTime.UtcNow - startTime).TotalMilliseconds;
            var usage = agentService.GetLastUsage();

            await SaveMessageAsync(
                dbContext,
                chatConversation,
                role: "assistant",
                content: assistantContent.ToString(),
                status: "completed",
                durationMs: (long)duration,
                usage,
                cancellationToken);

            await SSEEventWriters.WriteUsageEvent(
                httpContext.Response,
                duration,
                usage?.InputTokens ?? 0,
                usage?.OutputTokens ?? 0,
                usage?.TotalTokens ?? 0,
                cancellationToken);

            await SSEEventWriters.WriteDoneEvent(httpContext.Response, cancellationToken);
        }
        catch (ArgumentException ex) when (ex.Message.Contains("Invalid") && (ex.Message.Contains("attachments") || ex.Message.Contains("image") || ex.Message.Contains("file")))
        {
            Console.Write($"{ex.Message} - Console Message");
            // Validation errors from image/file processing - return 400 Bad Request
            var errorResponse = ErrorResponseFactory.CreateFromException(
                ex,
                400,
                environment.IsDevelopment());

            await SSEEventWriters.WriteErrorEvent(
                httpContext.Response,
                errorResponse.Detail ?? errorResponse.Title,
                cancellationToken);
        }
        catch (Exception ex)
        {
            var errorResponse = ErrorResponseFactory.CreateFromException(
                ex,
                500,
                environment.IsDevelopment());

            await SSEEventWriters.WriteErrorEvent(
                httpContext.Response,
                errorResponse.Detail ?? errorResponse.Title,
                cancellationToken);
        }


    }

    public static async Task<IResult> GetConversationMessages(
                string conversationId,
                ApplicationDbContext dbContext,
                CancellationToken cancellationToken)
    {
        var conversation = await dbContext.ChatConversation
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.FoundryConversationId == conversationId,
                cancellationToken);

        if (conversation is null)
        {
            return Results.NotFound(new { Message = "Conversation was not found.", ConversationId = conversationId });
        }

        var messages = await dbContext.ChatMessage
            .AsNoTracking()
            .Where(item => item.ChatConversationId == conversation.Id)
            .OrderByDescending(item => item.CreatedAt)
            .Select(item => new MessageInfo(
                item.Id,
                item.Role,
                item.Content,
                item.CreatedAt,
                null))
            .ToListAsync(cancellationToken);

        return Results.Ok(new ConversationMessagesResponse(conversationId, messages));
    }

    public static async Task<IResult> GetAgentInfo(
                AgentFrameworkService agentService,
                IHostEnvironment environment,
                  CancellationToken cancellationToken)
    {
        try
        {

            var agentDefinition = await agentService.GetPublicAgentMeta(cancellationToken);
            return Results.Ok(agentDefinition);
        }
        catch (ArgumentException ex) when (ex.Message.Contains("Invalid") && (ex.Message.Contains("attachments") || ex.Message.Contains("image") || ex.Message.Contains("file")))
        {
            Console.Write($"{ex.Message} - Console Message");
            // Validation errors from image/file processing - return 400 Bad Request
            var errorResponse = ErrorResponseFactory.CreateFromException(
                ex,
                400,
                environment.IsDevelopment());

            return Results.BadRequest(errorResponse);

        }
        catch (Exception ex)
        {
            var errorResponse = ErrorResponseFactory.CreateFromException(
                ex,
                500,
                environment.IsDevelopment());
            return Results.InternalServerError(errorResponse);

        }


    }

    private static async Task<(ChatConversation Conversation, bool IsNewConversation)> GetOrCreateConversationAsync(
        ApplicationDbContext dbContext,
        string sessionId,
        string conversationId,
        string firstMessage,
        CancellationToken cancellationToken)
    {
        var existingConversation = await dbContext.ChatConversation
            .FirstOrDefaultAsync(
                item => item.FoundryConversationId == conversationId,
                cancellationToken);

        if (existingConversation is not null)
        {
            if (!string.Equals(existingConversation.SessionId, sessionId, StringComparison.Ordinal))
            {
                throw new InvalidOperationException("Conversation does not belong to the supplied session.");
            }

            return (existingConversation, false);
        }

        var conversation = new ChatConversation
        {
            SessionId = sessionId,
            FoundryConversationId = conversationId,
            Content = BuildConversationTitle(firstMessage)
        };

        dbContext.ChatConversation.Add(conversation);
        await dbContext.SaveChangesAsync(cancellationToken);
        return (conversation, true);
    }

    private static string PrefixFirstMessageWithUserName(string message, string? firstName, string? lastName)
    {
        var fullName = string.Join(
            " ",
            new[] { firstName?.Trim(), lastName?.Trim() }
                .Where(item => !string.IsNullOrWhiteSpace(item)));

        if (string.IsNullOrWhiteSpace(fullName))
        {
            return message;
        }

        return $"My name, User Name: {fullName}\nMessage: {message}";
    }

    private static async Task<ChatMessage> SaveMessageAsync(
        ApplicationDbContext dbContext,
        ChatConversation chatConversation,
        string role,
        string content,
        string status,
        long? durationMs,
        (int InputTokens, int OutputTokens, int TotalTokens)? usage,
        CancellationToken cancellationToken)
    {
        var message = new ChatMessage
        {
            ChatConversationId = chatConversation.Id,
            Role = role,
            Content = content,
            Status = status,
            DurationMs = durationMs,
            PromptTokens = usage?.InputTokens,
            CompletionTokens = usage?.OutputTokens,
            TotalTokens = usage?.TotalTokens
        };

        dbContext.ChatMessage.Add(message);
        await dbContext.SaveChangesAsync(cancellationToken);
        return message;
    }

    private static string BuildConversationTitle(string message)
    {
        if (string.IsNullOrWhiteSpace(message))
        {
            return string.Empty;
        }

        var trimmedMessage = message.Trim();
        return trimmedMessage.Length <= 80
            ? trimmedMessage
            : $"{trimmedMessage[..77]}...";
    }

}
