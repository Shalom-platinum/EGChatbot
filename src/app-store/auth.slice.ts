
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppCurrentUser, AppCurrentUserArg, AuthStrategy, defaultUser } from "@/utils/AuthCacheHelpers";

export const initialState: AppCurrentUserArg = {
  user: null,
  isLoggedIn: false,
  isLoading: true,
  permissions: [],
  // token: null,
  // permissions: [],
  // strategy: null,

};
// auth.setCurrentUser({
//   user: {
//     email: v.account.username,
//     userId: profile.content?.adminUser?.id,
//     // adminUserId: 1,
//     lastName: profile.content?.adminUser?.lastName,
//     firstName: profile.content?.adminUser?.firstName
//   },
//   token: v.accessToken,
//   strategy: AuthStrategy.AZUREAD,
//   permissions: profile?.content.permissions.map((item: { feature: any; }) => item.feature),
// })
// login; save; get permission from redux;

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<AppCurrentUserArg>) => {
      const {user, permissions, strategy, token}  = action.payload
      // console.log(action.payload, "payload o")

      // state = { ...(action.payload) || {}}
      state.token = token;
      state.user =  user;
      state.strategy = strategy;
      state.permissions =  [...(permissions || [] )],
      state.isLoading = false;


      // console.log(user, token , "HERE O")
      if(user && token){
        state.isLoggedIn = true;
      }else{
        state.isLoggedIn = false;
      }
    },
    setAuthToken: (state, action: PayloadAction<{ token: string, strategy: AuthStrategy }>) => {

      //   const { user ,strategy, permissions, token } = action.payload;
      // const auth = Auth();
      const { token, strategy } = action.payload;
      state.token = token;
      state.strategy = strategy;
      state.isLoading = false;
      state.isLoggedIn = true;



    },

    clearAuthUser: (state) => {

      //   const { user ,strategy, permissions, token } = action.payload;
      // const auth = useAuth();
      // const { token, strategy } = action.payload;
      state.token = null;
      state.isLoading = false;
      state.isLoggedIn = false;
      state.user = null



    }
  }

})

export const { setAuthToken, setAuthUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer