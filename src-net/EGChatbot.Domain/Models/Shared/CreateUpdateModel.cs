using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EGChatbot.Domain.Models.Shared
{
    public class CreateUpdateModel
    {
        public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
        public DateTimeOffset? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
    }
}
