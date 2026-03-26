using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using EGChatbot.Domain.Models.Shared;

namespace EGChatbot.Domain.Models
{
    public class Session:CreateUpdateModel
    {
        public string Id { get; set; }  // uuid: todo, make uuidv7() later;

        // public string SessionKey {get; set;} // uuid string
        public string Email { get; set; }
        // public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNo { get; set; }
        // public string? PhotoURL { get; set; }
        // public virtual Address Address { get; set; } = new Address();
        // public string Title { get; set; }

        //External Identity
        // public string ObjectIdentifier { get; set; }
        // public int ErpRef { get; set; }  

    }
}
