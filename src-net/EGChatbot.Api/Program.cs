using System.Security.Claims;
using EGChatbot.Api.Writers;
using EGChatbot.Application.Services;
using EGChatbot.Common.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Enable PII logging for debugging auth issues (ONLY IN DEVELOPMENT)
if (builder.Environment.IsDevelopment())
{
    Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
}

// Add ServiceDefaults (telemetry, health checks)
builder.AddServiceDefaults();

// Add ProblemDetails service for standardized RFC 7807 error responses
builder.Services.AddProblemDetails();

// Configure CORS for local development and production
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:8080" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // In development, allow any localhost port for flexibility
        if (builder.Environment.IsDevelopment())
        {
            policy.SetIsOriginAllowed(origin =>
            {
                if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    return uri.Host == "localhost" || uri.Host == "127.0.0.1";
                }
                return false;
            })
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

// Override ClientId and TenantId from environment variables if provided
// These will be set by azd during deployment or by AppHost in local dev
var clientId = builder.Configuration["ENTRA_SPA_CLIENT_ID"]
    ?? builder.Configuration["AzureAd:ClientId"];

if (!string.IsNullOrEmpty(clientId))
{
    builder.Configuration["AzureAd:ClientId"] = clientId;
    // Set audience to match the expected token audience claim
    builder.Configuration["AzureAd:Audience"] = $"api://{clientId}";
}

var tenantId = builder.Configuration["ENTRA_TENANT_ID"]
    ?? builder.Configuration["AzureAd:TenantId"];

if (!string.IsNullOrEmpty(tenantId))
{
    builder.Configuration["AzureAd:TenantId"] = tenantId;
}

const string RequiredScope = "Chat.ReadWrite";
const string ScopePolicyName = "RequireChatScope";

// Add Microsoft Identity Web authentication
// Validates JWT bearer tokens issued for the SPA's delegated scope
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(options =>
    {
        builder.Configuration.Bind("AzureAd", options);
        var configuredClientId = builder.Configuration["AzureAd:ClientId"];

        options.TokenValidationParameters.ValidAudiences = new[]
        {
            configuredClientId,
            $"api://{configuredClientId}"
        };

        options.TokenValidationParameters.NameClaimType = ClaimTypes.Name;
        options.TokenValidationParameters.RoleClaimType = ClaimTypes.Role;
    }, options => builder.Configuration.Bind("AzureAd", options));


builder.Services.AddEndpointsApiExplorer();

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellation) =>
    {
        document.Info.Title = "CPOR Manager API";
        document.Info.Version = "v1";
        document.Info.Description = "API for document management and PDF Generation";

        document.Servers =
        [
            new OpenApiServer { Url = "https://cpormanager-dybveffkg4gbbwh9.westeurope-01.azurewebsites.net" }
        ];

        // Add Bearer authentication scheme
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, OpenApiSecurityScheme>();

        document.Components.SecuritySchemes.Add("Bearer", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Enter your JWT token"
        });


        // Apply Bearer to all operations
        document.SecurityRequirements = new List<OpenApiSecurityRequirement>
    {
            new() {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            }
    };
        return Task.CompletedTask;
    });


});

// Register Azure AI Agent Service for Azure AI Foundry v2 Agents
// Uses Azure.AI.Projects SDK which works with v2 Agents API (/agents/ endpoint with human-readable IDs).
// builder.Services.AddScoped<OpenApiToolExecutor>();

builder.Services.AddScoped<AgentFrameworkService>();


var app = builder.Build();

// Add exception handling middleware for production
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
}


// Add status code pages for consistent error responses
app.UseStatusCodePages();


// Map health checks
app.MapDefaultEndpoints();

// Serve static files from wwwroot (frontend)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowFrontend");

// Note: HTTPS redirection not needed - Azure Container Apps handles SSL termination at ingress
// The container receives HTTP traffic on port 8080

// // Add authentication and authorization middleware
// Add RATE LIMITING
// ADD TOKEN LIMIT MAX PER ANONYMOUS/GUEST ID




// Streaming Chat endpoint: Streams agent response via SSE (conversationId → chunks → usage → done)
// Supports MCP tool approval flow with previousResponseId and mcpApproval parameters
app.MapPost("/api/chat/stream", async (
    ChatRequest request,
    AgentFrameworkService agentService,
    HttpContext httpContext,
    IHostEnvironment environment,
    CancellationToken cancellationToken) =>
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
})
// .RequireAuthorization(ScopePolicyName)
.WithName("StreamChatMessage");



// Fallback route for SPA - serve index.html for any non-API routes
app.MapFallbackToFile("index.html");

// Configure Kestrel to listen on the configured port
var port = builder.Configuration["PORT"] ?? "5000";



app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options.Title = "CPOR Manager API";
    options.Servers = [

    new ScalarServer
        (
            "https://cpormanager-dybveffkg4gbbwh9.westeurope-01.azurewebsites.net",
             "Production"
        ),
        new ScalarServer
        (
            $"http://localhost:{port}",
            "Development"
        )
    ];
    options.Authentication = new ScalarAuthenticationOptions
    {
        PreferredSecuritySchemes = ["Bearer"],
    };
});


app.Run();
