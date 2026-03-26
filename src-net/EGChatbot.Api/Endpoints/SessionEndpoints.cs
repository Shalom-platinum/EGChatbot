using System.ComponentModel.DataAnnotations;
using EGChatbot.Application.Services;
using EGChatbot.Domain.Data;
using EGChatbot.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace EGChatbot.Api.ModuleEndpoints
{
    public static class SessionEndpoints
    {
        public static IEndpointRouteBuilder MapSessionEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var apiGroup = endpoints.MapGroup("/api/sessions")
                .WithOpenApi()
                .WithTags("Sessions")
                .RequireRateLimiting("IpSafe");

            apiGroup.MapPost("/visitor", SessionService.CreateVisitorSessionAsync)
                .WithName("CreateVisitorSession")
                .Produces<VisitorSessionResponse>(StatusCodes.Status201Created)
                .ProducesValidationProblem();

            return endpoints;
        }

   
    }
}