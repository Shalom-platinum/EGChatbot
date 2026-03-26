using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace EGChatbot.Domain.Enums
{
    public enum GenderOption
    {
        [EnumMember(Value = "Male")]
        Male = 1,

        [EnumMember(Value = "Female")]
        Female = 2,

        [EnumMember(Value = "Others")]
        Others = 3

    }
}
