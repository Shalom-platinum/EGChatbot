using EGChatbot.Application;

namespace EGChatbot.Api.ModuleEndpoints
{
    public static class CartEndpoints
    {
        public static IEndpointRouteBuilder MapCartEndpoints(this IEndpointRouteBuilder endpoints)
        {
            var apiGroup =
                endpoints.MapGroup("")
                    .WithOpenApi()
                    .WithTags("Carts");

            // apiGroup.MapPost("/cart/addcart", CartService.AddCartItems);
            // apiGroup.MapGet("cart/getcart/{cartCode}", CartService.GetCart);
            // apiGroup.MapDelete("cart/deletecart", CartService.DeleteCart);


            return endpoints;
        }
    }
}
