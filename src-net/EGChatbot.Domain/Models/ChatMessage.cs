using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using EGChatbot.Domain.Models.Shared;

namespace EGChatbot.Domain.Models
{
    public class ChatMessage : CreateUpdateModel
    {
        public string Id { get; set; } = Guid.CreateVersion7().ToString();
        public int ChatConversationId { get; set; }
        public virtual ChatConversation ChatConversation { get; set; } = null!;
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int? PromptTokens { get; set; }
        public int? CompletionTokens { get; set; }
        public int? TotalTokens { get; set; }
        public long? DurationMs { get; set; }

    }
}
