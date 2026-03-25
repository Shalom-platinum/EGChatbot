using System.Runtime.CompilerServices;
using System.ComponentModel;
using System.Net.Http.Headers;

using Microsoft.Agents.AI;
using Azure.Core;
using Azure.Identity;
using OpenAI.Responses;
using EGChatbot.Common.Models;

// using WebApp.Api.Models;
using Azure.AI.Projects;
using Azure.AI.Projects.OpenAI;
using EGChatbot.Application.Writers;

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

    public static async Task StreamChatEndpointAsync(ChatRequest request,
                AgentFrameworkService agentService,
                HttpContext httpContext,
                IHostEnvironment environment,
                CancellationToken cancellationToken)
    {
        try
        {

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


            var conversationId = request.ConversationId
                ?? await agentService.CreateConversationAsync(request.Message, cancellationToken);

            await SSEEventWriters.WriteConversationIdEvent(httpContext.Response, conversationId, cancellationToken);

            var startTime = DateTime.UtcNow;

            await foreach (var chunk in agentService.StreamMessageAsync(conversationId, request.Message
    , cancellationToken: cancellationToken))
            {
                if (chunk.IsText && chunk.TextDelta != null)
                {
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


}
