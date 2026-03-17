import { AuthenticationResult, Configuration, EventMessage, EventType, LogLevel, PopupRequest, PublicClientApplication, RedirectRequest, SilentRequest } from "@azure/msal-browser";
// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
    auth: {
        clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
        authority: import.meta.env.VITE_MSAL_AUTHORITY,
        redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URL,
        postLogoutRedirectUri: "/",
    },
    cache: {
        cacheLocation: 'localStorage', // This configures where your cache will be stored
        storeAuthStateInCookie: true,
    },
    system: {
        allowNativeBroker: false, // Disables WAM Broker
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) return;
                console.log(message);
            },
            logLevel: LogLevel.Info
        }

    }
};


export const loginRequest: PopupRequest | RedirectRequest | SilentRequest = {
    scopes: ["api://37ce214e-c020-41f3-bf71-39b4704b0ba0/access_as_user","openid", "profile", "email"], //"openid", "profile", "email" were just added for the SSO
}

export const apiRequest = {
    scopes: [
        // `${window.grifAdalConfig.griffinApiUri}/admin.read`,
        // `${window.grifAdalConfig.griffinApiUri}/portfolio.read`,
        // `${window.grifAdalConfig.griffinApiUri}/trading.read`,
        `https://reliancedeerptrial.onmicrosoft.com/odgclient/user_impersonation`,

        // `admin.read`,
        // `portfolio.read`,
        // `trading.read`,
        // `user_impersonation`,

        // window.grifAdalConfig.appId,

        'offline_access',
        // 'email',
        // 'openid',
        // 'profile',
    ]
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};


export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize and Attach necessary signin events/callbacks;
// @ts-ignore
const initialize = async () => {
    const initial = await msalInstance.initialize();
    console.log(initial, msalInstance.getAllAccounts());
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
    }

    msalInstance.addEventCallback((event: EventMessage) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const payload = event.payload as AuthenticationResult;
            const account = payload.account;
            // fetch(`${baseURL}/createCustomer`, {
            //     method: "POST",
            //     body: JSON.stringify({
            //         firstName: accounts[0]?.name.split(" ")[0],
            //         lastName: accounts[0]?.name.split(" ")[1],
            //         email: accounts[0]?.username,
            //         custormerGuid: accounts[0]?.localAccountId
            //     }),
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // })
            //     .then(res => res.json())
            //     .then(data => console.log(data))
            //     .catch(err => console.log(err));
            msalInstance.setActiveAccount(account);
        }
    });
}

initialize()

