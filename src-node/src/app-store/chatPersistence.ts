import type { Middleware } from "@reduxjs/toolkit";
import type { AppState } from "@/app-model/appState";

export const CHAT_PERSISTENCE_KEY = "egchatbot.chat.identity";
export const CHAT_IDENTITY_TTL_MS = 1000 * 60 * 60 * 12;

type PersistedChatIdentity = {
  currentSessionId: string | null;
  currentConversationId: string | null;
  expiresAt: number;
};

type ChatIdentityState = Pick<
  AppState["chat"],
  "currentSessionId" | "currentConversationId"
>;

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function clearPersistedChatIdentity(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(CHAT_PERSISTENCE_KEY);
}

export function loadPersistedChatIdentity(): ChatIdentityState {
  if (!isBrowser()) {
    return {
      currentSessionId: null,
      currentConversationId: null,
    };
  }

  const rawValue = window.localStorage.getItem(CHAT_PERSISTENCE_KEY);
  if (!rawValue) {
    return {
      currentSessionId: null,
      currentConversationId: null,
    };
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<PersistedChatIdentity>;
    if (
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= Date.now()
    ) {
      clearPersistedChatIdentity();
      return {
        currentSessionId: null,
        currentConversationId: null,
      };
    }

    return {
      currentSessionId: parsed.currentSessionId ?? null,
      currentConversationId: parsed.currentConversationId ?? null,
    };
  } catch {
    clearPersistedChatIdentity();
    return {
      currentSessionId: null,
      currentConversationId: null,
    };
  }
}

function persistChatIdentity(chatState: AppState["chat"]): void {
  if (!isBrowser()) {
    return;
  }

  console.log('clearPersistedChatIdentity', chatState)
  if (!chatState.currentSessionId) {
    clearPersistedChatIdentity();
    return;
  }

  const value: PersistedChatIdentity = {
    currentSessionId: chatState.currentSessionId,
    currentConversationId: chatState.currentConversationId,
    expiresAt: Date.now() + CHAT_IDENTITY_TTL_MS,
  };

  window.localStorage.setItem(CHAT_PERSISTENCE_KEY, JSON.stringify(value));
}

export const chatPersistenceMiddleware: Middleware =
  (storeApi) => (next) => (action) => {
    const result = next(action);
    console.log(result, 'IAMMIDDLEMAN')
    const type = action?.["type"];
    if (
      type === "chat/setChatIdentity" ||
      type === "chat/setCurrentConversationId" ||
      type === "chat/clearChatIdentity" ||
      type === "CHAT_START_STREAM" ||
      type === "CHAT_CLEAR"
    ) {
      const state = storeApi.getState() as AppState;
      persistChatIdentity(state.chat);
    }

    return result;
  };
