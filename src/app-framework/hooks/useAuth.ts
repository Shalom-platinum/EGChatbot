// import { UserState, logOut, setLoading, signIn } from '@/app-store/user.slice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Cookies from "js-cookie"
import { RootState } from '@/app-store/store'
import { setAuthUser, setAuthToken, clearAuthUser } from "@/app-store/auth.slice";
import { AppCurrentUser, AppCurrentUserArg, AuthCacheHelpers, AuthStrategy } from '@/app-framework/AuthCacheHelpers';
// import { defaultUser, AuthCacheHelpers } from "app-framework/AuthHook";



const useAuth = () => {
    const dispatch = useDispatch();
    // const xxx = lt();

    const { user, isLoggedIn, isLoading, strategy, permissions } = useSelector<RootState, AppCurrentUserArg>(x => x.auth as any);

    // useEffect(()=>{
    //         alert(isLoggedIn)
    // }, [isLoggedIn])


    const attemptAuth = (payload: Partial<AppCurrentUserArg>) => {

        const { user, strategy, permissions, token } = payload;
        console.log(payload, "attempting...")
        const x = AuthCacheHelpers.setCurrentUser({
            user: user,
            token: token,
            strategy,
            permissions, //: profile?.content.permissions.map((item: { feature: any; }) => item.feature),
        });

        dispatch(setAuthUser(
            payload as any,
        ))
        return true;
    }

    const setTokenOnly = (payload: { token: string, strategy: AuthStrategy }) => {
        const { token, strategy } = payload;
        AuthCacheHelpers.setAuth(token, strategy);

        dispatch(setAuthToken(
            { token, strategy },
        ))
        return true;
    }

    const refreshToken = async () => {
        // const { token, strategy } = payload;
        const auth = await AuthCacheHelpers.refreshAuth();
        if (auth) {
            const { token, strategy } = auth;
            // const tokens = await AuthCacheHelpers.refreshAuth();

            dispatch(setAuthToken(
                { token, strategy },
            ))
            return auth;
        }
        return null;
    }


    const refreshAuth = async () => {

        const user = AuthCacheHelpers.getCurrentUser();
        const auth = await AuthCacheHelpers.refreshAuth();
        const permissions = AuthCacheHelpers.getPermissions();

        if (auth?.token && user) {
            const { token, strategy } = auth;
            // console.log(user, strategy, permissions, 'still avaly?')

            const x = AuthCacheHelpers.setCurrentUser({
                user: user.user,
                token: auth.token,
                strategy,
                permissions, //: profile?.content.permissions.map((item: { feature: any; }) => item.feature),
            });

            dispatch(setAuthUser(
                {
                    user: user.user as AppCurrentUser,
                    token,
                    strategy,
                    permissions,
                    // isLoggedIn: true,
                    isLoading: false
                }
            ));
            // console.log('I hit here')

            return true;
        }


        dispatch(setAuthUser(
            {
                user: null,//user.user as AppCurrentUser,
                token: null,
                isLoggedIn: false,
                strategy,
                permissions: [],
                isLoading: false
            }
        ));
        // AuthCacheHelpers.setCurrentUser({
        //     user: null,
        //     token: null,
        //     strategy: AuthStrategy.PLAIN_AUTH,
        //     permissions: [], //: profile?.content.permissions.map((item: { feature: any; }) => item.feature),
        // });


        // dispatch(setAuthUser(
        //     {
        //         user: null,//user.user as AppCurrentUser,
        //         token:  null,
        //         // strategy,
        //         permissions: [],
        //         isLoading: false
        //     }
        // ));

        

        return false;
    }


    const attemptLogout = async (strategy: AuthStrategy) => {
        //Maybe push this into redux.
        // Cookies.remove("user");
        // Cookies.remove("auth_key");


        dispatch(clearAuthUser());
        await AuthCacheHelpers.logout(strategy);

        return true;

    }

    const isPermittedFor = (permissionCheck: string) => {
        // we have user's current permission; lets check if it includes what we need
        // export const checkUserHasPermission = (permissions: any[], permission: PermissionTypes) :boolean =>{
        return !permissionCheck ? true : permissions.map(x => x?.feature).includes(permissionCheck)
        //   }
    }

    return {
        isLoggedIn: isLoggedIn,
        user,
        isPermittedFor,
        attemptAuth,
        setTokenOnly,
        refreshToken,
        isLoading: isLoading,
        attemptLogout,
        authStrategy: strategy,
        refreshAuth,

        permissions
    }
}

export default useAuth;
