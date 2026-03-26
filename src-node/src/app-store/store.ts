import { configureStore } from '@reduxjs/toolkit'
import { api } from '@/app-services';
import { SCMSapi } from '@/app-services/auth.serviceSCMS';
import chatReducer from './chat.slice';
import { chatPersistenceMiddleware } from './chatPersistence';
// import userSlice from './user.slice';
// import { authSlice } from './auth.slice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    [api.reducerPath]: api.reducer,
    [SCMSapi.reducerPath]: SCMSapi.reducer,
    // auth: authSlice.reducer,
    // user: userSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatPersistenceMiddleware, api.middleware, SCMSapi.middleware) //.concat(qapi2.middleware)
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store;
