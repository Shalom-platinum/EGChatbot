namespace EGChatbot.Domain;

public class JsonDoNothingNamingPolicy : System.Text.Json.JsonNamingPolicy
{
	public static JsonDoNothingNamingPolicy DefaultInstance = new();

	public override string ConvertName(string name) => name;
}
