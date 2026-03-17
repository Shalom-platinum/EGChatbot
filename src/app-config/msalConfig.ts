// @ts-nocheck
import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
    auth: {
        clientId: 'de563de5-e0ab-46cf-94ff-0f1d1797b4fc',
        authority: 'https://ODGClientExternal.ciamlogin.com/',
        // authority: 'https://login.microsoftonline.com/38ab41e3-078e-4db4-999d-a588d53a5a13',
        redirectUri: window.location.origin,
        knownAuthorities: ['https://login.microsoftonline.com'],
        postLogoutRedirectUri: "/",

        // clientId: '9acd1a65-6e64-402e-af1a-eee2277f1800',
        // authority: 'https://login.microsoftonline.com/48339d9e-aaaa-41cd-a9ce-84e284c1a8be',
        // redirectUri: window.location.origin,
        // knownAuthorities: ['https://login.microsoftonline.com'],
        // postLogoutRedirectUri: "/",
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    }
}

export const loginRequest = {
    scopes: ["api://de563de5-e0ab-46cf-94ff-0f1d1797b4fc/cfa"],
    // scopes: ["api://9acd1a65-6e64-402e-af1a-eee2277f1800/Appuser"],
};

export const msalInstance = new PublicClientApplication(msalConfig);
export const handleLogin = async () => {
    let response = null;
    try {
        try {
            response = await msalInstance.ssoSilent({
                scopes: [loginRequest.scopes[0]],
            });
        } catch (error) {
            console.log("Trying Popup Login");
            response = await msalInstance.loginPopup({
                scopes: [loginRequest.scopes[0]],
            })
        }

        if (response.account) {
            console.log(response.account);
            msalInstance.setActiveAccount(response.account)
        } else {
            console.error("Login Failed")
        }

    } catch (error) {
        console.error(error)
    }
}
export const handleLogout = async () => {
    try {
        await msalInstance.logoutPopup();
    }
    catch (error) {
        console.error(error);
    }
}

export const handleRefresh = async (): Promise<string> => {
    try {
        const activeAccount = msalInstance.getActiveAccount();

        if (!activeAccount) {
            throw new Error('No active account found');
        }

        const request = {
            scopes: loginRequest.scopes,
            account: activeAccount,
            forceRefresh: true
        };

        const result = await msalInstance.acquireTokenSilent(request);
        return result.accessToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Optionally trigger interactive login
        throw error;
    }
};

export async function getAccessToken(scopes: string[]): Promise<string> {
    const activeAccount = msalInstance.getActiveAccount();
    if (!activeAccount) {
        // No account -> require sign-in
        throw new Error("No active account. Call handleLogin() first.");
    }

    const silentRequest = {
        scopes,
        account: activeAccount,
        forceRefresh: false, // try cache first
    };

    try {
        // Try silent (cached or refresh by MSAL if expired)
        const silentResult: AuthenticationResult = await msalInstance.acquireTokenSilent(silentRequest);
        return silentResult.accessToken;
    } catch (err: any) {
        // If interaction required (expired refresh token, consent needed, etc.) -> fallback to interactive
        if (err instanceof InteractionRequiredAuthError) {
            // Try popup interactive flow first (better UX). Use acquireTokenPopup if popups are allowed.
            const popupRequest: PopupRequest = { scopes, prompt: "select_account" };
            try {
                const popupResult: AuthenticationResult = await msalInstance.acquireTokenPopup(popupRequest);
                return popupResult.accessToken;
            } catch (popupErr) {
                // If popup blocked or fails, fall back to redirect (visitor will navigate)
                await msalInstance.acquireTokenRedirect({ scopes });
                // Note: acquireTokenRedirect will redirect the page and not return here.
                throw popupErr;
            }
        }

        // Unknown error -> optionally force refresh network call once
        try {
            const forceResult = await msalInstance.acquireTokenSilent({ ...silentRequest, forceRefresh: true });
            return forceResult.accessToken;
        } catch (finalErr) {
            throw finalErr;
        }
    }
}