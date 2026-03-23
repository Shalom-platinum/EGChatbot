import { loginRequest, msalInstance } from "@/app-config/auth.config"

export interface AppCurrentUser {
    lastName: string
    firstName: string
    userId: number,
    email: string,
    // adminUserId?: number
    // sysPermission?: string[]
}
// Convert all to redux;

export enum AuthStrategy {
    AZUREAD = 'AZUREAD',
    PLAIN_AUTH = 'PLAINAUTH'
}

export const AuthStorageKeys = {

}

export type AppCurrentUserArg = {
    user: AppCurrentUser | null,
    token?: string | null,
    strategy?: AuthStrategy,
    permissions: any[],
    isLoggedIn?: boolean,
    isLoading?: boolean,
}

export const defaultUser: AppCurrentUser = {
    lastName: "User",
    firstName: "Guest",
    userId: 0,
    email: "name@example.com",
    // adminUserId: 1,
    // sysPermission: []
}
export interface CurrentUserObj {
    user?: AppCurrentUser
    token?: string
}

export class AuthCacheHelpers {
    //DONE
    static getCurrentUser = (): null | CurrentUserObj => {
        const user = localStorage.getItem('user') as string;
        const token = localStorage.getItem('token') as string;

        if (user || token) {
            return {
                user: JSON.parse(user),
                token: token,
            }
        }
        return null;
    }


    static setCurrentUser = ({ user, token, strategy, permissions }: Partial<AppCurrentUserArg>) => {
        if (!user) throw new Error('Inavlid user body');
        if (!token) throw new Error('Inavlid token body');

        localStorage.setItem('user', JSON.stringify(user));
        this.setAuth(token, strategy as AuthStrategy);

        if (permissions) { this.setPermisssions(permissions) }

        // localStorage.setItem('token', token);
        // localStorage.setItem('authStrategy', strategy || AuthStrategy.PLAIN_AUTH);

        return user;
    }

    static setAuth = (token: string, strategy: AuthStrategy) => {
        localStorage.setItem('token', token);
        localStorage.setItem('authStrategy', strategy || AuthStrategy.PLAIN_AUTH);
        return token;
    }

    static isLoggedIn = () => {
        const user = localStorage.getItem('user') as string;
        const token = localStorage.getItem('token') as string;

        return user !== null && token !== null;
    }


    static authStrategy = () => {
        const authStrategy = localStorage.getItem('authStrategy') as string;

        return authStrategy;
    }


    static refreshAuth = async (): Promise<{ token: string; strategy: AuthStrategy } | null> => {
        // if sttrategy is azure msal, then refresh silently; else get bare token for normal auth;
        const strategy = localStorage.getItem('authStrategy');
        const currentToken = this.getCurrentUser()?.token;
        const currentUser = this.getCurrentUser()?.user;

        if (currentToken) {
            if (!strategy || strategy === AuthStrategy.PLAIN_AUTH) {
                return {
                    token: this.getCurrentUser()?.token as string, // no need for refresh 
                    strategy: strategy as AuthStrategy,
                }
            }

            const account = msalInstance.getActiveAccount();
            if (!account) {
                throw Error("No active account! Verify a user has been signed in.");
            }

            const authResult = await msalInstance.acquireTokenSilent(
                {
                    ...loginRequest,
                    account: account, //msalInstance.getActiveAccount(),
                }
            );
            const accessToken = authResult.accessToken;
            this.setAuth(accessToken, strategy as AuthStrategy);
            return { token: accessToken, strategy: strategy as AuthStrategy };
            // setCurrentUser({
            //     user: currentUser!,//getCurrentUser().user as AppCurrentUser,
            //     token: accessToken
            // })
            // return getCurrentUser()?.token; // no need for refresh 

        }

        return null;

        // return user && token;
    }

    static logout = async (strategy: AuthStrategy) => {

        localStorage.removeItem("token")
        localStorage.removeItem("user")
        localStorage.removeItem("redirectUrl")
        localStorage.removeItem("authStrategy")
        localStorage.removeItem("userPermissions")

        console.log('clearing...')

        if (strategy === AuthStrategy.AZUREAD) {
            await msalInstance.logoutRedirect(loginRequest);
            // window.location.assign("/admin/login")
        }

        return true;

        // window.location.assign("/readers/home")
    }

    static setPermisssions = (permission: string[]) => {
        if (!permission) {
            return null
        }
        localStorage.setItem("userPermissions", JSON.stringify(permission)
        )
    }

    static getPermissions = () => {
        const permission = localStorage.getItem("userPermissions")
        return permission ? JSON.parse(permission) : null
    }

}