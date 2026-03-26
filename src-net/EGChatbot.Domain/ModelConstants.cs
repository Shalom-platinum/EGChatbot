namespace EGChatbot.Domain;

public static class ModelConstants
{

	public const string V1ApiPrefix = "/v1/api";


	public const int AccessTokenRefreshLimit = 1_800_000;

	public const int OtpAgeThreshold = 5;

	public const int OtpSize = 6;


	public static readonly JsonDocumentOptions DocumentParsingOptions = new()
	{
		AllowTrailingCommas = true,
		CommentHandling = JsonCommentHandling.Skip,
		//MaxDepth = 512,
	};

	private static System.Text.Json.JsonSerializerOptions _DefaultSerializerOptions;
	public static System.Text.Json.JsonSerializerOptions DefaultSerializerOptions
	{
		get
		{
			if (_DefaultSerializerOptions is null)
			{
                _DefaultSerializerOptions = new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.General)
                {
                    PropertyNamingPolicy = JsonDoNothingNamingPolicy.DefaultInstance,
					PropertyNameCaseInsensitive = true,

                    NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString | System.Text.Json.Serialization.JsonNumberHandling.AllowNamedFloatingPointLiterals,

                    //TODO - review general cases, requires explicit JsonIgnore
                    IgnoreReadOnlyProperties = false,

					DictionaryKeyPolicy = JsonDoNothingNamingPolicy.DefaultInstance,

					AllowTrailingCommas = true,

					//TODO - weigh pros and cons of JsonNode and JsonElement (compare with Newtonsoft)
					//UnknownTypeHandling = JsonUnknownTypeHandling.JsonNode,

					WriteIndented = true,
				};

				_DefaultSerializerOptions.Converters.Add(
					new System.Text.Json.Serialization.JsonStringEnumConverter(namingPolicy: JsonDoNothingNamingPolicy.DefaultInstance, allowIntegerValues: true));
			}

			return _DefaultSerializerOptions;
		}
		//set => _DefaultSerializerOptions = value;
	}

	private static System.Text.Json.JsonSerializerOptions _NoIndentSerializerOptions;
	public static System.Text.Json.JsonSerializerOptions NoIndentSerializerOptions
	{
		get
		{
			if (_NoIndentSerializerOptions is null)
			{
                _NoIndentSerializerOptions = new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.General)
                {
                    PropertyNamingPolicy = JsonDoNothingNamingPolicy.DefaultInstance,
					PropertyNameCaseInsensitive = true,

                    NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString | System.Text.Json.Serialization.JsonNumberHandling.AllowNamedFloatingPointLiterals,

                    //TODO - review general cases, requires explicit JsonIgnore
                    IgnoreReadOnlyProperties = false,

					DictionaryKeyPolicy = JsonDoNothingNamingPolicy.DefaultInstance,

					AllowTrailingCommas = true,

					//TODO - weigh pros and cons of JsonNode and JsonElement (compare with Newtonsoft)
					//UnknownTypeHandling = JsonUnknownTypeHandling.JsonNode,

					WriteIndented = true,
				};

				_NoIndentSerializerOptions.Converters.Add(
					new System.Text.Json.Serialization.JsonStringEnumConverter(namingPolicy: JsonDoNothingNamingPolicy.DefaultInstance, allowIntegerValues: true));
			}

			return _NoIndentSerializerOptions;
		}
		//set => _NoIndentSerializerOptions = value;
	}

}
