import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Define a type for the slice state
type OidMember = {
    $oid: string
};

export interface ProfileState { _id: OidMember, completed_rate: number };
export type ProfileStateArr = ProfileState[];

// Define the initial state using that type
const initialState: ProfileStateArr = [
    {
        _id: { $oid: "" },
        completed_rate: 0
    }
]

export const userSlice = createSlice({
    name: 'profile',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        setProfile: (state, payload: PayloadAction<ProfileStateArr>) => {
            console.log(state);
            state = { ...payload.payload }
        },
    
    },
})

export const { setProfile } = userSlice.actions;
export default userSlice;