using EGChatbot.Api.Writers;
using EGChatbot.Application;
using EGChatbot.Application.Services;
using EGChatbot.Common.Models;

namespace EGChatbot.Api.ModuleEndpoints
{
    public static class CartEndpoints
    {
        public static IEndpointRouteBuilder MapChatEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var apiGroup =
                endpoints.MapGroup("/api")
                    .WithOpenApi()
                    .WithTags("Chat");
            // Streaming Chat endpoint: Streams agent response via SSE (conversationId → chunks → usage → done)
            // Supports MCP tool approval flow with previousResponseId and mcpApproval parameters
            apiGroup.MapPost("/chat/stream", ChatService.StreamChatEndpointAsync)
             .WithName("StreamChatMessage");

 
            return endpoints;
        }
    }
}
