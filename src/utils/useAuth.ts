// useAuth.js (Custom Hook)
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/app-config/msalConfig";
import { useIsAuthenticated } from "@azure/msal-react"
import { AuthCacheHelpers, type AppCurrentUserArg, type AuthStrategy } from "./AuthCacheHelpers";
import { useDispatch } from "react-redux";
import { setAuthToken, setAuthUser } from "@/app-store/auth.slice";

export const useAuth = () => {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated()
    const dispatch = useDispatch()

    // Define the login function
    //@ts-ignore
    const handleLogin = async () => {
        try {
            // Using loginPopup which returns an AuthenticationResult including accessToken
            const result = await instance.loginPopup({ ...loginRequest });
            console.log(result, "msal");
            localStorage.setItem('Token', result?.accessToken ?? '');
        } catch (error) {
            console.error(error)
        }
    };

    // Define the logout function
    const handleLogout = (method = "popup") => {
        if (method === "redirect") {
            instance.logoutRedirect();
        } else {
            instance.logoutPopup();
        }
        localStorage.removeItem('Token');
        localStorage.removeItem('replacedRoute');
    };

    const attemptAuth = (payload: Partial<AppCurrentUserArg>) => {

        const { user, strategy, permissions, token } = payload;
        console.log(payload, "attempting...")
        AuthCacheHelpers.setCurrentUser({
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

    // Return the necessary state and functions
    return {
        isAuthenticated,
        username: accounts[0]?.username,
        name: accounts[0]?.name,
        handleLogin,
        handleLogout,
        attemptAuth,
        setTokenOnly,
    };
};

