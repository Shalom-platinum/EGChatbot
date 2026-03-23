// Or from '@reduxjs/toolkit/query/react'
import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { API_KEY, baseURL } from '@/app-config/api.config';
import {
    ICreateCustomerRequest,
    IEligibilityMatrix, IEligibilityMatrixResponse,
    IGetServiceLocationResponse,
    ISetServiceLocationRequest
} from './@types/types';
import { loginRequest, msalInstance } from '@/app-config/msalConfig';
import { AuthCacheHelpers } from '@/app-framework/AuthCacheHelpers';

const formDataHeaders = new Headers();
// formDataHeaders.append('Content-Type', 'multipart/form-data')

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


const api = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Post'],
    endpoints: (build) => ({

        // getCohortByOpportunityId: build.query<any, { id: string }>({
        //   query: (body) => ({ url: `/opportunity/${body.id}/dynamiccohort` }),
        //   async transformResponse(baseQueryReturnValue, meta, arg) {
        //     const res = baseQueryReturnValue;
        //     return res?.data;
        //   },
        // }),


        // createOpportunity: build.mutation<any, any>({
        //   query: (body) => ({ url: `/opportunity`, method: 'POST', body, formData: true }),
        //   async transformResponse(baseQueryReturnValue, meta, arg) {
        //     const res = baseQueryReturnValue;
        //     return res?.data;
        //   },
        // }),


        createCustomer: build.mutation<any, ICreateCustomerRequest>({
            query: (body) => ({ url: `/customers`, method: 'POST', body }),
        }),

        eligibilityMatrix: build.mutation<IEligibilityMatrixResponse, IEligibilityMatrix>({
            query: (body) => ({ url: `/bookings/eligibility-matrix`, method: 'POST', body }),
        }),

        getCustomerEligibility: build.query<any, any>({
            query: (body) => ({ url: `/customers/eligibility?email=${body.email}`}),
        }),

        createOffice: build.mutation<any, any>({
            query: (body) => ({
                url: `/createOffice?officeAddress=${body.officeAddress}`,
                method: 'POST',
                body
            }),
        }),

        setServiceLocation: build.mutation<any, ISetServiceLocationRequest>({
            query: (body) => ({ url: `/setServiceLocation`, method: 'POST', body }),
        }),

        getServiceLocation: build.query<IGetServiceLocationResponse[], any>({
            query: (body) => ({ url: `/getServiceLocation` }),
        }),

        createCustomerBookings: build.mutation<any, any>({
            query: (body) => ({ url: `/createCustomerBookings`, method: 'POST', body }),
        }),

        customerSignIn: build.mutation({
            query: (body) => ({ url: `/customerSignIn`, method: 'POST', body }),
        }),

        // Appointments Section

    }),
});

export { api }