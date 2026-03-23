import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { OidMember } from '@/app-model/OidMember'
// import type { RootState } from '../../app/store'

// Define a type for the slice state
// export type OidMember = {
//     $oid: string
// };

export interface UserState {
    state: {
        isLoading?: boolean
        authToken: string | null
        isLoggedIn: boolean
    },
    data: {
        _id: OidMember
        email: string
        first_name: string
        last_name?: string
        location: string
        profiles?: [{ _id: OidMember, completed_rate: number }],
        gender: string
        nationality?: string
        date_of_birth: string
        department: string
        job_title: string
    }
}

// Define the initial state using that type
const initialState: UserState = {
    state: {
        authToken: null,
        isLoggedIn: false,
        isLoading: true
    },
    data: {
        profiles: [{
            _id: { $oid: "" },
            completed_rate: 0
        }],
        gender: '',
        date_of_birth: '',
        department: '',
        job_title: '',
        email: '',
        first_name: '',
        location: '',
        _id: {
            $oid: ''
        }
    }
}

export const userSlice = createSlice({
    name: 'user',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        signIn: (state, payload: PayloadAction<UserState>) => {
            state.state = { ...payload.payload.state, isLoading: false }
            state.data = { ...payload.payload.data }
        },
        setLoading: (state, payload: PayloadAction<{ isLoading: boolean }>) => {
            state.state.isLoading = payload.payload.isLoading// { ...payload.payload.state, isLoading: false }
            // state.data = { ...payload.payload.data }
        },
         logOut: (state) => {
            state.state =  {...initialState.state, isLoading:false} ;//{.., isLoading: false }
            // state.state.isLoading = false;

            state.data = initialState.data
        },

    },
})

export const { signIn, setLoading, logOut } = userSlice.actions

export default userSlice;