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
using OpenAI.Chat;
using Microsoft.Extensions.AI;
using System.ClientModel;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Plugins.OpenApi;
using OpenAI;
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
    // private readonly OpenApiToolExecutor apiExecutor;

    private readonly ILogger<AgentFrameworkService> logger;
    private ChatClientAgent? cachedAgent;
    private AgentMetadataResponse? cachedMetadata;
    private readonly SemaphoreSlim _agentLock = new(1, 1);
    private bool _disposed = false;
    private ResponseTokenUsage? _lastUsage;
    public AgentFrameworkService(
        IConfiguration _configuration,
        ILogger<AgentFrameworkService> _logger)
    {
        logger = _logger;
        var endpoint = _configuration["AI_AGENT_ENDPOINT"]
            ?? throw new InvalidOperationException("AI_AGENT_ENDPOINT is not configured");
        modelDeploymentName = _configuration["MODEL_DEPLOYMENT_NAME"]
                ?? throw new InvalidOperationException("MODEL_DEPLOYMENT_NAME is not configured");
        agentId = _configuration["AI_AGENT_ID"]
            ?? throw new InvalidOperationException("AI_AGENT_ID is not configured");

        _logger.LogDebug(
            "Initializing AgentFrameworkService: endpoint={Endpoint}, agentId={AgentId}",
            endpoint,
            agentId);


        var environment = _configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production";
        projectClient = new AIProjectClient(new Uri(endpoint), "");
        logger.LogInformation("AIProjectClient initialized successfully");
    }


    public async Task<ChatClientAgent> GetMachineAgentDefn(CancellationToken cancellationToken)
    {

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

        string? userAccessToken = null,  // Add this parameter

        McpApprovalResponse? mcpApproval = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);


        // CREATE LOCAL AGENT
        var machineDefn = await GetMachineAgentDefn();

        var deploymentName = _modelDeploymentName;  // Use configured deployment, not hardcoded "gpt-4o"
        var filePath = Path.Combine(AppContext.BaseDirectory, "Properties", $"openapi3_0.json");

        var httpClient = new HttpClient();
        httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer",
            userAccessToken
            );

        KernelPlugin plugin = await OpenApiKernelPluginFactory.CreateFromOpenApiAsync("TradeOfficeERP", filePath, new()
        {
            HttpClient = httpClient
        }, cancellationToken: cancellationToken);

        // Convert the Semantic Kernel plugin to Agent Framework function tools.
        // This requires a dummy Kernel instance, since KernelFunctions cannot execute without one.
        Kernel kernel = new();
        List<AITool> tools = plugin.Select(x => x.WithKernel(kernel)).Cast<AITool>().ToList();


        OpenAIClientOptions openAIClientOptions = new() { Endpoint = new Uri("https://models.github.ai/inference") };
        var chatagent = new OpenAIClient(new ApiKeyCredential(_openAIKey), openAIClientOptions).GetChatClient("openai/o4-mini").AsAIAgent(
                        name: "New OpenAI Agent",
                        description: "Big Agent",
                        instructions: machineDefn.Instructions,
                        tools: [.. tools, AIFunctionFactory.Create(GetWeather)]
                    );
        // ANTHROPIC SDK
        // OPEN AI -- GPTs
        // AGENT FRAMEWORK -> Open AI, nt


        // AGENT FRAMEWORK SDK >>> ;
        // N8N - Agentic Workflow >>> OpenAI Key (PAID)

        //.GetOpenAIModelClient("gpt-4o-mini");
        // var chatagent = new ChatClientAgent(
        //     chatClient: chatClient.AsIChatClient(),
        //     // : _modelDeploymentName,
        //     name: "New OpenAI Agent",
        //                 description: "Big Agent",
        //     instructions: machineDefn.Instructions,
        //         tools: [.. tools, AIFunctionFactory.Create(GetWeather)]
        // );

        //         var myFastAgent = await _projectClient.CreateAIAgentAsync(
        //             name: "AssistantName",
        //             model: deploymentName,
        //             description: "Big Agent",
        //             instructions: machineDefn.Instructions,
        //             tools: [.. tools, AIFunctionFactory.Create(GetWeather)]
        // , cancellationToken: cancellationToken);
        // CREATE AGENT SESSION with Foundry conversation ID
        AgentSession session = await chatagent.CreateSessionAsync(cancellationToken);

        ChatClientAgentSession typedSession = (ChatClientAgentSession)session;

        Console.Write(typedSession?.ConversationId);


        _logger.LogInformation(
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



        _logger.LogInformation("Completed streaming for conversation: {ConversationId}", conversationId);
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
            _logger.LogDebug("AgentFrameworkService disposed");
        }
    }
}
