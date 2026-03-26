// Or from '@reduxjs/toolkit/query/react'
import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { API_KEY, baseURL } from '@/app-config/api.config';
import { loginRequest, msalInstance } from '@/app-config/msalConfig';
import { AuthCacheHelpers } from '@/app-framework/AuthCacheHelpers';


const baseQuery = fetchBaseQuery({
    baseUrl: baseURL,
    prepareHeaders: async (headers) => {
        try {
            const accessToken = await AuthCacheHelpers.refreshAuth();
            headers.set('authorization', `Bearer ${accessToken?.token}`)

            return headers;
        } catch (error) {
            console.error('Failed to acquire token:', error);
            const result = msalInstance.loginPopup(loginRequest);
            // @ts-ignore
            headers.set('Authorization', `Bearer ${result?.accessToken}`);
        }

        return headers;
    },
});

// Wrapper with automatic retry on 401
export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // Try to refresh the token
        try {
            const activeAccount = msalInstance.getActiveAccount();

            if (activeAccount) {
                const request = {
                    scopes: loginRequest.scopes,
                    account: activeAccount,
                    forceRefresh: true,
                };

                await msalInstance.acquireTokenSilent(request);

                // Retry the original query
                result = await baseQuery(args, api, extraOptions);
            }
        } catch (error) {
            // If refresh fails, redirect to login
            console.error('Token refresh failed:', error);
            // Optional: dispatch logout action or redirect
        }
    }

    return result;
};


const SCMSapi = createApi({
    reducerPath: "SCMSapi",
    baseQuery: baseQueryWithReauth,
    endpoints: (build) => ({

        getApps: build.query<any, any>({
            query: (body) => ({ url: `/customer/${body.email}/apps` }),
        }),

    }),
});

export { SCMSapi }