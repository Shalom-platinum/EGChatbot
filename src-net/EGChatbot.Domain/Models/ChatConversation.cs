using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using EGChatbot.Domain.Models.Shared;

namespace EGChatbot.Domain.Models
{
    public class ChatConversation : CreateUpdateModel
    {
        public int Id { get; set; }
        public string SessionId { get; set; } = string.Empty;
        public virtual Session Session { get; set; } = null!;
        public string FoundryConversationId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
