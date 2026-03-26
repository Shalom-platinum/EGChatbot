import { AppState, initialAppState } from '@/app-model/appState';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Dispatch } from 'react';
import type { AppAction } from '@/app-model/appState';
import { ChatService } from '@/app-services/chatService';
import type { RootState } from './store';
import type { AppError } from '@/app-model/errors';
import { loadPersistedChatIdentity } from './chatPersistence';

export type ChatState = AppState['chat']

const initialState: ChatState = {
    ...initialAppState.chat,
    ...loadPersistedChatIdentity(),
}

type SendMessageArgs = {
    apiUrl: string;
    getAccessToken: () => Promise<string | null>;
    messageText: string;
    sessionId: string;
    currentConversationId: string | null;
    files?: File[];
}

type SendMcpApprovalArgs = {
    apiUrl: string;
    getAccessToken: () => Promise<string | null>;
    sessionId: string;
    approvalRequestId: string;
    approved: boolean;
    previousResponseId: string;
    conversationId: string;
}

let chatServiceSingleton: ChatService | null = null;

const getChatService = (
    apiUrl: string,
    getAccessToken: () => Promise<string | null>,
    dispatch: Dispatch<AppAction>
) => {
    if (!chatServiceSingleton) {
        chatServiceSingleton = new ChatService(
            apiUrl,
            getAccessToken,
            dispatch
        );
        return chatServiceSingleton;
    }

    chatServiceSingleton.configure(
        apiUrl,
        getAccessToken,
        dispatch
    );

    return chatServiceSingleton;
};

export const sendMessageThunk = createAsyncThunk<void, SendMessageArgs, { state: RootState }>(
    'chat/sendMessage',
    async (args, thunkApi) => {
        const chatService = getChatService(
            args.apiUrl,
            args.getAccessToken,
            thunkApi.dispatch as unknown as Dispatch<AppAction>
        );

        await chatService.sendMessage(
            args.messageText,
            args.currentConversationId,
            args.sessionId,
            args.files
        );
    }
);

export const sendMcpApprovalThunk = createAsyncThunk<void, SendMcpApprovalArgs, { state: RootState }>(
    'chat/sendMcpApproval',
    async (args, thunkApi) => {
        const chatService = getChatService(
            args.apiUrl,
            args.getAccessToken,
            thunkApi.dispatch as unknown as Dispatch<AppAction>
        );

        await chatService.sendMcpApproval(
            args.approvalRequestId,
            args.approved,
            args.previousResponseId,
            args.conversationId,
            args.sessionId
        );
    }
);

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        patchChatState: (state, action: PayloadAction<Partial<ChatState>>) => ({
            ...state,
            ...action.payload,
        }),
        setChatIdentity: (
            state,
            action: PayloadAction<{
                sessionId: string;
                conversationId?: string | null;
            }>
        ) => {
            state.currentSessionId = action.payload.sessionId;
            if (action.payload.conversationId !== undefined) {
                state.currentConversationId = action.payload.conversationId;
            }
        },
        setCurrentConversationId: (state, action: PayloadAction<string | null>) => {
            state.currentConversationId = action.payload;
        },
        clearChatIdentity: (state) => {
            state.currentSessionId = null;
            state.currentConversationId = null;
        },
    
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(
                (action): action is Extract<AppAction, { type: 'CHAT_SEND_MESSAGE' }> => action.type === 'CHAT_SEND_MESSAGE',
                (state, action) => {
                    state.messages.push(action.message);
                    state.status = 'sending';
                    state.error = null;
                }
            )
            .addMatcher(
                (action): action is Extract<AppAction, { type: 'CHAT_ADD_ASSISTANT_MESSAGE' }> => action.type === 'CHAT_ADD_ASSISTANT_MESSAGE',
                (state, action) => {
                    const existing = state.messages.some(msg => msg.id === action.messageId);
                    if (!existing) {
                        state.messages.push({
                            id: action.messageId,
                            role: 'assistant',
                            content: '',
                            more: { time: new Date().toISOString() },
                        });
                    }
                }
            )
            .addMatcher(
                (action): action is Extract<AppAction, { type: 'CHAT_START_STREAM' }> => action.type === 'CHAT_START_STREAM',
                (state, action) => {
                    state.status = 'streaming';
                    state.streamingMessageId = action.messageId;
                    if (action.conversationId) {
                        state.currentConversationId = action.conversationId;
                    }
                    state.error = null;
                }
            )
            .addMatcher(
                (action): action is Extract<AppAction, { type: 'CHAT_STREAM_CHUNK' }> => action.type === 'CHAT_STREAM_CHUNK',
                (state, action) => {
                    const assistantMessage = state.messages.find(msg => msg.id === action.messageId);
                    if (assistantMessage) {
                        assistantMessage.content += action.content;
                    }
                }
            )
            .addMatcher(
                (action): action is Extract<AppAction, { type: 'CHAT_STREAM_ANNOTATIONS' }> => action.type === 'CHAT_STREAM_ANNOTATIONS',
                (state, action) => {
                    const assistantMessage = state.messages.find(msg => msg.id === action.messageId);
                    if (assistantMessage) {
                        assistantMessage.annotations = action.annotations;
                    }
                }
            )
            .addMatcher(
                (action): action is Extract<AppAction, { type: 'CHAT_MCP_APPROVAL_REQUEST' }> => action.type === 'CHAT_MCP_APPROVAL_REQUEST',
                (state, action) => {
                    const assistantMessage = state.messages.find(msg => msg.id === action.messageId);
                    if (assistantMessage) {
                        assistantMessage.role = 'approval';
                        assistantMessage.mcpApproval = action.approvalRequest;
                    }
                }
            )
            .addMatcher(
                (action): action is Extract<AppAction, { type: 'CHAT_STREAM_COMPLETE' }> => action.type === 'CHAT_STREAM_COMPLETE',
                (state, action) => {
                    state.status = 'idle';
                    const assistantMessage = state.messages.find(msg => msg.id === state.streamingMessageId);
                    if (assistantMessage) {
                        assistantMessage.more = {
                            ...assistantMessage.more,
                            usage: action.usage,
                        };
                    }
                    state.streamingMessageId = undefined;
                }
            )
            .addMatcher(
                (action): action is Extract<AppAction, { type: 'CHAT_ERROR' }> => action.type === 'CHAT_ERROR',
                (state, action) => {
                    state.status = 'error';
                    state.error = action.error;
                    state.streamingMessageId = undefined;
                }
            )
            .addMatcher(
                (action): action is PayloadAction<undefined> => action.type === 'CHAT_CANCEL_STREAM',
                (state) => {
                    state.status = 'idle';
                    state.streamingMessageId = undefined;
                }
            )
            .addMatcher(
                (action): action is PayloadAction<undefined> => action.type === 'CHAT_CLEAR',
                (state) => {
                    state.status = 'idle';
                    state.messages = [];
                    state.currentConversationId = null;
                    state.error = null;
                    state.streamingMessageId = undefined;
                }
            )
            .addMatcher(
                (action): action is PayloadAction<undefined> => action.type === 'CHAT_CLEAR_ERROR',
                (state) => {
                    state.error = null;
                    if (state.status === 'error') {
                        state.status = 'idle';
                    }
                }
            );
    },
})

export const {
    patchChatState,
    setChatIdentity,
    setCurrentConversationId,
    clearChatIdentity,
} = chatSlice.actions;
export default chatSlice.reducer;