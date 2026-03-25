using Azure.AI.Projects;
using Azure.Identity;
using OpenAI.Responses;
using Azure.AI.Projects.OpenAI;
using System.Text.Json;
using OpenAI.Assistants;
using EGChatbot.Common.Models;

namespace EGChatbot.Application.Writers
{
#pragma warning disable OPENAI001


    public static class SSEEventWriters
    {
        public static async Task  WriteConversationIdEvent(HttpResponse response, string conversationId, CancellationToken ct)
        {
            await response.WriteAsync(
                $"data: {{\"type\":\"conversationId\",\"conversationId\":\"{conversationId}\"}}\n\n",
                ct);
            await response.Body.FlushAsync(ct);
        }


        public static async Task  WriteChunkEvent(HttpResponse response, string content, CancellationToken ct)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(new { type = "chunk", content });
            await response.WriteAsync($"data: {json}\n\n", ct);
            await response.Body.FlushAsync(ct);
        }

        public static async Task  WriteAnnotationsEvent(HttpResponse response, List<AnnotationInfo> annotations, CancellationToken ct)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(new
            {
                type = "annotations",
                annotations = annotations.Select(a => new
                {
                    type = a.Type,
                    label = a.Label,
                    url = a.Url,
                    fileId = a.FileId,
                    textToReplace = a.TextToReplace,
                    startIndex = a.StartIndex,
                    endIndex = a.EndIndex,
                    quote = a.Quote
                })
            });
            await response.WriteAsync($"data: {json}\n\n", ct);
            await response.Body.FlushAsync(ct);
        }

        public static async Task  WriteMcpApprovalRequestEvent(HttpResponse response, McpApprovalRequest approval, CancellationToken ct)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(new
            {
                type = "mcpApprovalRequest",
                approvalRequest = new
                {
                    id = approval.Id,
                    toolName = approval.ToolName,
                    serverLabel = approval.ServerLabel,
                    arguments = approval.Arguments
                }
            });
            await response.WriteAsync($"data: {json}\n\n", ct);
            await response.Body.FlushAsync(ct);
        }

        public static async Task  WriteUsageEvent(HttpResponse response, double duration, int promptTokens, int completionTokens, int totalTokens, CancellationToken ct)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(new
            {
                type = "usage",
                duration,
                promptTokens,
                completionTokens,
                totalTokens
            });
            await response.WriteAsync($"data: {json}\n\n", ct);
            await response.Body.FlushAsync(ct);
        }

        public static async Task  WriteDoneEvent(HttpResponse response, CancellationToken ct)
        {
            await response.WriteAsync("data: {\"type\":\"done\"}\n\n", ct);
            await response.Body.FlushAsync(ct);
        }

        public static async Task  WriteErrorEvent(HttpResponse response, string message, CancellationToken ct)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(new { type = "error", message });
            await response.WriteAsync($"data: {json}\n\n", ct);
            await response.Body.FlushAsync(ct);
        }







    }
}







// {"type":"response.created","sequence_number":0,"response":{"id":"resp_ab490fa630cb3739006981f58dfb4081909b0114af6cf89adc","object":"response","created_at":1770124686,"status":"in_progress","background":false,"completed_at":null,"content_filters":null,"conversation":{"id":"conv_ab490fa630cb373900IGY8GwpFaatIYWtCMP2JrnLw01GLCGqY"},"error":null,"incomplete_details":null,"instructions":"Tell the user some of the things you can do for them in plain english using the openapi tool.\n\n\"If any tool returns an error (HTTP 500, 401 Unauthorized, anything not 200 OK) or an empty response, do not stop. Simply inform the user that the operation failed and ask if they would like to try a different approach.\"","max_output_tokens":null,"max_tool_calls":null,"model":"gpt-4o","output":[],"parallel_tool_calls":true,"previous_response_id":null,"prompt_cache_key":null,"prompt_cache_retention":null,"reasoning":{"effort":null,"summary":null},"safety_identifier":null,"service_tier":"auto","store":true,"temperature":1.0,"text":{"format":{"type":"text"},"verbosity":"medium"},"tool_choice":null,"tools":[{"type":"openapi","openapi":{"name":"t2openapi","description":"T2 Open API Spec","spec":{"openapi":"3.0.1","info":{"title":"CPOR Manager API","description":"API for document management and PDF Generation","version":"v1"},"servers":[{"url":"https://cpormanager-dybveffkg4gbbwh9.westeurope-01.azurewebsites.net"}],"paths":{"/v1/api/accounts/{id}":{"get":{"tags":["Acct Contacts"],"operationId":"get_v_api_accounts_id","parameters":[{"name":"id","in":"path","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"200":{"description":"OK"}}}},"/v1/api/accounts":{"get":{"tags":["Acct Contacts"],"operationId":"get_v_api_accounts","parameters":[{"name":"PageNumber","in":"query","schema":{"type":"integer","format":"int32","default":1}},{"name":"PageSize","in":"query","schema":{"type":"integer","format":"int32","default":10}}],"responses":{"200":{"description":"OK"}}}},"/v1/api/dashboard/stats":{"get":{"tags":["Common Apis"],"operationId":"get_v_api_dashboard_stats","responses":{"200":{"description":"OK"}}}},"/v1/api/myProfile":{"get":{"tags":["Common Apis"],"operationId":"get_v_api_myProfile","responses":{"200":{"description":"OK"}}}},"/v1/api/refs/{refName}":{"get":{"tags":["Common Apis"],"operationId":"get_v_api_refs_refName","parameters":[{"name":"PageNumber","in":"query","schema":{"type":"integer","format":"int32","default":1}},{"name":"PageSize","in":"query","schema":{"type":"integer","format":"int32","default":10}},{"name":"refName","in":"path","required":true,"schema":{"$ref":"#/components/schemas/RefType"}}],"responses":{"200":{"description":"OK"}}}},"/v1/api/refs/RefLicenses":{"post":{"tags":["Common Apis"],"operationId":"post_v_api_refs_RefLicenses","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/RefLicense"}}},"required":true},"responses":{"200":{"description":"OK"}}}},"/v1/api/refs/RefPartnerCenters":{"post":{"tags":["Common Apis"],"operationId":"post_v_api_refs_RefPartnerCenters","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/RefPartnerCenters"}}},"required":true},"responses":{"200":{"description":"OK"}}}},"/v1/api/refs/{refName}/bulkDelete":{"post":{"tags":["Common Apis"],"operationId":"post_v_api_refs_refName_bulkDelete","parameters":[{"name":"refName","in":"path","required":true,"schema":{"$ref":"#/components/schemas/RefType"}}],"requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/DelRefEntityTO"}}},"required":true},"responses":{"200":{"description":"OK"}}}},"/v1/api/refs/RefLicenses/{entityId}":{"patch":{"tags":["Common Apis"],"operationId":"patch_v_api_refs_RefLicenses_entityId","parameters":[{"name":"entityId","in":"path","required":true,"schema":{"type":"integer","format":"int64"}}],"requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/RefLicense"}}},"required":true},"responses":{"200":{"description":"OK"}}}},"/v1/api/refs/RefPartnerCenters/{entityId}":{"patch":{"tags":["Common Apis"],"operationId":"patch_v_api_refs_RefPartnerCenters_entityId","parameters":[{"name":"entityId","in":"path","required":true,"schema":{"type":"integer","format":"int64"}}],"requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/RefPartnerCenters"}}},"required":true},"responses":{"200":{"description":"OK"}}}},"/v1/api/users/{id}":{"get":{"tags":["IAM & Users"],"operationId":"get_v_api_users_id","parameters":[{"name":"id","in":"path","required":true,"schema":{"type":"integer","format":"int32"}}],"responses":{"200":{"description":"OK"}}}},"/v1/api/users":{"get":{"tags":["IAM & Users"],"operationId":"get_v_api_users","parameters":[{"name":"PageNumber","in":"query","schema":{"type":"integer","format":"int32","default":1}},{"name":"PageSize","in":"query","schema":{"type":"integer","format":"int32","default":10}}],"responses":{"200":{"description":"OK"}}}},"/v1/api/users/updateRole":{"post":{"tags":["IAM & Users"],"operationId":"post_v_api_users_updateRole","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/UpdateUserPermissionTO"}}},"required":true},"responses":{"200":{"description":"OK"}}}},"/v1/webhook/adobeEvents":{"get":{"tags":["Webhook Endpoints"],"operationId":"get_v_webhook_adobeEvents","responses":{"200":{"description":"OK"}}},"post":{"tags":["Webhook Endpoints"],"operationId":"post_v_webhook_adobeEvents","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/JsonDocument"}}},"required":true},"responses":{"200":{"description":"OK"}}}}},"components":{"schemas":{"DelRefEntityTO":{"required":["entityIds"],"type":"object","properties":{"entityIds":{"type":"array","items":{"type":"integer","format":"int64"}}}},"JsonDocument":{},"KnownUserRoles":{"enum":["Admin","Executive","User"]},"RefLicense":{"required":["sku","name"],"type":"object","properties":{"sku":{"type":"string"},"name":{"maxLength":255,"type":"string"},"group":{"type":"string","nullable":true},"description":{"type":"string","nullable":true},"id":{"type":"integer","format":"int64"},"updatedBy":{"type":"integer","format":"int64","nullable":true},"createdBy":{"type":"integer","format":"int64","nullable":true},"createdAt":{"type":"string","format":"date-time"},"updatedAt":{"type":"string","format":"date-time","nullable":true},"deletedAt":{"type":"string","format":"date-time","nullable":true}}},"RefPartnerCenters":{"required":["name","countryISO"],"type":"object","properties":{"name":{"maxLength":255,"type":"string"},"countryISO":{"type":"string"},"description":{"type":"string","nullable":true},"id":{"type":"integer","format":"int64"},"updatedBy":{"type":"integer","format":"int64","nullable":true},"createdBy":{"type":"integer","format":"int64","nullable":true},"createdAt":{"type":"string","format":"date-time"},"updatedAt":{"type":"string","format":"date-time","nullable":true},"deletedAt":{"type":"string","format":"date-time","nullable":true}}},"RefType":{"enum":["RefLicenses","RefPartnerCenters"]},"UpdateUserPermissionTO":{"type":"object","properties":{"userId":{"type":"integer","format":"int64"},"role":{"$ref":"#/components/schemas/KnownUserRoles"}}}},"securitySchemes":{"Bearer":{"type":"http","description":"Enter your JWT token","scheme":"bearer","bearerFormat":"JWT"}}},"security":[{"Bearer":[]}],"tags":[{"name":"Acct Contacts"},{"name":"Common Apis"},{"name":"IAM & Users"},{"name":"Webhook Endpoints"}]},"auth":{"type":"project_connection","security_scheme":{"project_connection_id":"/subscriptions/9b3d0913-756d-490b-8e2f-be3f24bb8c53/resourceGroups/rg-abdulgaffar-9451/providers/Microsoft.CognitiveServices/accounts/abdulgaffar-4423-resource/projects/abdulgaffar-4423/connections/test_openapi"}}}},{"type":"memory_search","memory_store_name":"MemoryStore-busy_garden_38n86rdvxg","scope":"defaultUser"}],"top_logprobs":0,"top_p":1.0,"truncation":"disabled","usage":null,"user":null,"metadata":{},"agent":{"type":"agent_id","name":"T2MobilePOC","version":"19"}}}


// {"type":"response.output_text.delta","sequence_number":85,"item_id":"msg_ab490fa630cb3739006981f59115c08190bbd82716f58e0dab","output_index":0,"content_index":0,"delta":" assist","logprobs":[],"obfuscation":"btf4YCADn"}

