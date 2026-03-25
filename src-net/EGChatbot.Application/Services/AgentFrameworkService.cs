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
public class AgentFrameworkService : IDisposable
{
    private readonly AIProjectClient projectClient;
    // private readonly AzureOpenAIClient aiChatClient;

    private readonly string agentId;
    private readonly string modelDeploymentName;
    private readonly ILogger<AgentFrameworkService> logger;
    
    // Cached Agent and Meta to prevent REFETCHING ON EVERY REQ/RESPONSE, Plus SemaphoreSlim too;
    private ChatClientAgent? cachedAgent;
    private AgentMetadataResponse? cachedMetadata;
    private readonly SemaphoreSlim _agentLock = new(1, 1);
    private bool _disposed = false;
    // Caching items end here;

    private ResponseTokenUsage? _lastUsage;
    public AgentFrameworkService(
        IConfiguration _configuration,
        IHostEnvironment hostEnvironment,
        ILogger<AgentFrameworkService> _logger)
    {
        logger = _logger;
        var endpoint = GetRequiredSetting(_configuration, "AI_AGENT_ENDPOINT");
        modelDeploymentName = GetRequiredSetting(_configuration, "MODEL_DEPLOYMENT_NAME");
        agentId = GetRequiredSetting(_configuration, "AI_AGENT_ID");

        logger.LogDebug(
            "Initializing AgentFrameworkService: endpoint={Endpoint}, agentId={AgentId}",
            endpoint,
            agentId);

        TokenCredential credential;
 
        if (hostEnvironment.IsDevelopment())
        {
            _logger.LogInformation("Development: Using ChainedTokenCredential (AzureCli -> AzureDeveloperCli)");
            credential = new ChainedTokenCredential(
                new AzureCliCredential(),
                new AzureDeveloperCliCredential()
            );
        }
        else
        {
            _logger.LogInformation("Production: Using ManagedIdentityCredential (system-assigned)");
            credential = new ManagedIdentityCredential();
        }

        projectClient = new AIProjectClient(new Uri(endpoint), credential);
        logger.LogInformation("AIProjectClient initialized successfully");
    }

    private static string GetRequiredSetting(IConfiguration configuration, string key)
    {
        var value = configuration[key];
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException($"{key} is not configured");
        }

        return value;
    }


    public async Task<ChatClientAgent> GetMachineAgentDefn(CancellationToken cancellationToken)
    {
        // TODO: Ensure to place a lock on this, coz it will be called many times;
        var agentDefinition = await projectClient.GetAIAgentAsync(name: agentId, cancellationToken: cancellationToken);
        return agentDefinition;
    }

    /// <summary>
    /// Get basic agent info string (for debugging).
    /// </summary>
    public async Task<string> GetAgentInfoAsync(CancellationToken cancellationToken = default)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        var agent = await GetMachineAgentDefn(cancellationToken);
        var agentVersion = agent.GetService<AgentVersion>();
        return agentVersion?.Name ?? agentId;
    }


    /// <summary>
    /// Create a new conversation for the agent.
    /// Uses ProjectConversation from Azure.AI.Projects for server-managed state.
    /// </summary>
    public async Task<string> CreateConversationAsync(string? firstMessage = null, CancellationToken cancellationToken = default)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);

        try
        {
            logger.LogInformation("Creating new conversation");

            ProjectConversationCreationOptions conversationOptions = new();

            if (!string.IsNullOrEmpty(firstMessage))
            {
                // Store title in metadata (truncate to 50 chars)
                var title = firstMessage.Length > 50
                    ? firstMessage[..50] + "..."
                    : firstMessage;
                conversationOptions.Metadata["title"] = title;

            }
            // WE SHOULD BE ABLE TO RETRIEVE EXISTING CONVERSATION AND CONTINUE;
            ProjectConversation conversation
                = await projectClient.OpenAI.Conversations.CreateProjectConversationAsync(
                    conversationOptions,
                    cancellationToken);

            logger.LogInformation(
                "Created conversation: {ConversationId}",
                conversation.Id);
            return conversation.Id;
        }
        catch (OperationCanceledException)
        {
            logger.LogWarning("Conversation creation was cancelled");
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create conversation");
            throw;
        }
    }




    /// <summary>
    /// Streams agent response for a message using ProjectResponsesClient (Responses API).
    /// Returns StreamChunk objects containing text deltas, annotations, or MCP approval requests.
    /// </summary>
    /// <remarks>
    /// Uses direct ProjectResponsesClient instead of IChatClient because we need access to:
    /// - McpToolCallApprovalRequestItem for MCP approval flows
    /// - FileSearchCallResponseItem for file search quotes  
    /// - MessageResponseItem.OutputTextAnnotations for citations
    /// The IChatClient abstraction doesn't expose these specialized response types.
    /// </remarks>
    public async IAsyncEnumerable<StreamChunk> StreamMessageAsync(
        string conversationId,
        string message,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);


        // CREATE LOCAL AGENT
        var chatagent = await GetMachineAgentDefn(cancellationToken);
     
        // CREATE AGENT SESSION with Foundry conversation ID
        AgentSession session = await chatagent.CreateSessionAsync(cancellationToken);

        ChatClientAgentSession typedSession = (ChatClientAgentSession)session;

        Console.Write(typedSession?.ConversationId);


        logger.LogInformation(
            "Streaming message to conversation: {ConversationId}",
            typedSession?.ConversationId

         );

        AgentRunOptions options = new()
        {
            AllowBackgroundResponses = true,
        };

        await foreach (var update in chatagent.RunStreamingAsync(message: message, session: session, options: options, cancellationToken: cancellationToken))
        {
            yield return StreamChunk.Text(update.Text);
            Console.Write(update.Text);
        }

        logger.LogInformation("Completed streaming for conversation: {ConversationId}", conversationId);
    }


    /// <summary>
    /// Get token usage from the last streaming response.
    /// </summary>
    public (int InputTokens, int OutputTokens, int TotalTokens)? GetLastUsage() =>
        _lastUsage is null ? null : (_lastUsage.InputTokenCount, _lastUsage.OutputTokenCount, _lastUsage.TotalTokenCount);

    public void Dispose()
    {
        if (!_disposed)
        {
            _disposed = true;
            _agentLock.Dispose();
            logger.LogDebug("AgentFrameworkService disposed");
        }
    }
}
