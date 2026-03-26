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
using System.ComponentModel.DataAnnotations;
using EGChatbot.Domain.Models;
using EGChatbot.Domain.Data;

namespace EGChatbot.Application.Services;

public sealed record CreateVisitorSessionRequest
{
    public required string Name { get; init; }
    public required string Phone { get; init; }
    public required string Email { get; init; }
}

public sealed record VisitorSessionResponse
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Phone { get; init; }
    public required string Email { get; init; }
    public required DateOnly CreatedAt { get; init; }
}

#pragma warning disable OPENAI001

/// <summary>
/// Azure AI Foundry agent service using v2 Agents API.
/// </summary>
/// <remarks>
/// Uses Microsoft.Agents.AI.AzureAI extension methods on AIProjectClient for agent loading,
/// and direct ProjectResponsesClient for streaming (required for annotations, MCP approvals).
/// See .github/skills/researching-azure-ai-sdk/SKILL.md for SDK patterns.
/// </remarks>
public class SessionService(
    ILogger<SessionService> _logger)
{

    private readonly ILogger<SessionService> logger = _logger;


    public static async Task<IResult> CreateVisitorSessionAsync(
        CreateVisitorSessionRequest request,
        ApplicationDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var errors = ValidateRequest(request);
        if (errors.Count > 0)
        {
            return Results.ValidationProblem(errors);
        }

        var (firstName, lastName) = SplitName(request.Name);

        var session = new Session
        {
            Id = Guid.CreateVersion7().ToString(), // UUID V7 Better, yes!!!
            FirstName = firstName,
            LastName = lastName,
            Email = request.Email.Trim(),
            PhoneNo = request.Phone.Trim()
        };

        dbContext.Sessions.Add(session);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = new VisitorSessionResponse
        {
            Id = session.Id,
            Name = string.IsNullOrWhiteSpace(session.LastName)
                ? session.FirstName
                : $"{session.FirstName} {session.LastName}",
            Email = session.Email,
            Phone = session.PhoneNo,
            CreatedAt = DateOnly.FromDateTime(session.CreatedAt.UtcDateTime)
        };

        return Results.Created($"/api/sessions/{session.Id}", response);
    }

    private static Dictionary<string, string[]> ValidateRequest(CreateVisitorSessionRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            errors[nameof(request.Name)] = ["Name is required."];
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            errors[nameof(request.Email)] = ["Email is required."];
        }
        else if (!new EmailAddressAttribute().IsValid(request.Email.Trim()))
        {
            errors[nameof(request.Email)] = ["Email must be a valid email address."];
        }

        if (string.IsNullOrWhiteSpace(request.Phone))
        {
            errors[nameof(request.Phone)] = ["Phone is required."];
        }

        return errors;
    }

    private static (string FirstName, string LastName) SplitName(string name)
    {
        var parts = name.Trim()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return parts.Length switch
        {
            0 => (string.Empty, string.Empty),
            1 => (parts[0], string.Empty),
            _ => (parts[0], string.Join(' ', parts.Skip(1)))
        };
    }

}
