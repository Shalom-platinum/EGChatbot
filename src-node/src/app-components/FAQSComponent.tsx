import { AppState } from "@/app-model/appState";
import { IChatItem } from "@/app-model/chat";
import { AppError } from "@/app-model/errors";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { UserMessage } from "./chat/UserMessage";
import { AssistantMessage } from "./chat/AssistantMessage";
import { ChatInput } from "./ChatInput";
import { useDispatch, useSelector, useStore } from "react-redux";
import { AppDispatch, RootState } from "@/app-store/store";
import { api } from "@/app-services";
import { AppSpinner } from "./AppSpinner";
import {
  ChatState,
  sendMessageThunk,
  setChatIdentity,
} from "@/app-store/chat.slice";
import { baseURL0 } from "@/app-config/api.config";
interface ChatInterfaceProps {
  messages: IChatItem[];
  status: AppState["chat"]["status"];
  error: AppError | null;
  streamingMessageId?: string;
  onSendMessage: (text: string, files?: File[]) => void;
  onMcpApproval?: (
    approvalRequestId: string,
    approved: boolean,
    previousResponseId: string,
    conversationId: string,
  ) => void;
  onClearError?: () => void;
  onOpenSettings?: () => void;
  onNewChat?: () => void;
  onCancelStream?: () => void;
  hasMessages?: boolean;
  disabled: boolean;
  agentName?: string;
  agentDescription?: string;
  agentLogo?: string;
  starterPrompts?: string[];
  conversationId?: string | null;
  getAccessToken?: () => Promise<string | null>;
  apiUrl?: string;
}
// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_OPTIONS = [
  "Enquiry",
  "Schedule Arrears",
  "Make a Claim",
  "Complaint",
  "Amendments",
  "Buy Policy",
  "Products Information",
  "Deceased Pickup (Funeral Services)",
  "Make Payment",
  "Property Services",
];

const BOT_INTRO = [
  "Hi, I am Babs and here to assist.",
  "You can request human help at anytime when you need more clarification to your questions.",
  "For now, I have these options for you to choose from.\nYou can ask me to show you this menu any time.",
];

const BOT_RANDOM_MESSAGES = [
  "Thanks for reaching out. Could you share your policy number?",
  "I can help with that. Do you want to continue from your last conversation?",
  "I have checked that request and can guide you through the next steps.",
  "Great question. Let me quickly walk you through your options.",
  "I can connect you to a human agent if you want immediate assistance.",
];

const USER_RANDOM_MESSAGES = [
  "I want to make a claim.",
  "Can I update my contact details?",
  "Please show me product information.",
  "I need help with my payment schedule.",
  "Can I continue my previous conversation?",
];

const QUICK_QUESTION_GROUPS = [
  {
    title: "Enterprise Properties LTD",
    items: [
      {
        label: "Business Area",
        prompt: "What is the business area of Enterprise Properties LTD?",
      },
      {
        label: "Our Services",
        prompt: "What are the services provided by Enterprise Properties LTD?",
      },
      {
        label: "Insurance Role",
        prompt: "Is EPL involved in selling or underwriting insurance policies?",
      },
    ],
  },
  {
    title: "EFSG",
    items: [
      {
        label: "Package Cost",
        prompt: "What is the cost of the Candlelight Package?",
      },
      {
        label: "Payment Methods",
        prompt: "What payment methods are accepted by Transitions?",
      },
      {
        label: "Payment Deadline",
        prompt: "When must all invoices be paid for funeral services?",
      },
    ],
  },
] as const;

function pickRandom(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)];
}

function generatePreviewMessages(count: number = 8): IChatItem[] {
  const messages: IChatItem[] = [];
  for (let index = 0; index < count; index += 1) {
    const role = index % 2 === 0 ? "assistant" : "user";
    messages.push({
      id: `${Date.now()}-${index}`,
      role,
      content:
        role === "assistant"
          ? pickRandom(BOT_RANDOM_MESSAGES)
          : pickRandom(USER_RANDOM_MESSAGES),
    });
  }

  return messages;
}

const GRADIENT =
  "linear-gradient(135deg, #e8184e 0%, #c0396b 60%, #8b2fc9 100%)";
const GRADIENT_BTN = "linear-gradient(135deg, #8b2fc9, #c0396b)";
const GRADIENT_USER = "linear-gradient(135deg, #e8184e, #8b2fc9)";

// On screens ≤ 1366 px wide the "mid" step is skipped — the button jumps
// straight from normal to the half-viewport full panel.
const SMALL_SCREEN_BREAKPOINT = 1366;
const STATES_FULL = ["normal", "full"]; // ≤ 1366 px
const STATES_LARGE = ["normal", "mid", "full"]; // > 1366 px

// ─── Viewport hook ────────────────────────────────────────────────────────────

function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const handler = () =>
      setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return vp;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

/**
 * mode      — current sizeMode ("normal" | "mid" | "full")
 * nextMode  — what clicking will transition to
 *
 * Icon communicates the *destination*, not the current state:
 *   → "full"   : half-panel split icon  (two vertical rectangles)
 *   → "mid"    : standard expand arrows
 *   → "normal" : compress/restore arrows
 */
function CycleExpandIcon({ nextMode }) {
  // Will expand to full half-panel
  if (nextMode === "full")
    return (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* two side-by-side panes — communicates "half viewport" */}
        <rect x="2" y="3" width="9" height="18" rx="1.5" />
        <rect x="13" y="3" width="9" height="18" rx="1.5" />
      </svg>
    );
  // Will expand to mid
  if (nextMode === "mid")
    return (
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 3 21 3 21 9" />
        <polyline points="9 21 3 21 3 15" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="21" x2="10" y2="14" />
      </svg>
    );
  // Will restore to normal
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="10" y1="14" x2="3" y2="21" />
      <line x1="21" y1="3" x2="14" y2="10" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ size = 40 }) {
  return (
    <div
      style={{ width: size, height: size, minWidth: size }}
      className="rounded-full overflow-hidden border-2 border-white shadow flex-shrink-0"
    >
      <img
        src="https://i.pravatar.cc/80?img=12"
        alt="Babs"
        className="w-full h-full object-cover"
        onError={(e) => {
          const img = e.currentTarget;
          const parent = img.parentElement;
          img.style.display = "none";
          if (parent) {
            parent.style.background = "#c0396b";
            parent.innerHTML =
              '<span style="color:white;font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center;height:100%">B</span>';
          }
        }}
      />
    </div>
  );
}

// ─── Shared header ────────────────────────────────────────────────────────────

function ChatHeader({
  showBack,
  onBack,
  rightSlot,
  isFull,
}: {
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: any;
  isFull?: boolean;
}) {
  const { data: metaData } = api.endpoints.getAgentMetadata.useQuery();

  return (
    <div
      className={`flex items-center gap-3 flex-shrink-0 ${isFull ? "px-6 py-4" : "px-4 py-3"}`}
      style={{ background: GRADIENT }}
    >
      {showBack && (
        <button
          onClick={onBack}
          className="text-white p-1 hover:opacity-75 transition -ml-1"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <Avatar size={isFull ? 44 : 38} />
      <div className="flex-1 min-w-0">
        <p
          className={`text-white font-bold leading-tight ${isFull ? "text-base" : "text-sm"}`}
        >
          {metaData?.name ?? "-"}
        </p>
        <p className="text-pink-100 text-xs">Reply in 10 seconds.</p>
      </div>
      {rightSlot}
    </div>
  );
}

// ─── Screen 1: Pre-chat form ──────────────────────────────────────────────────

function PreChatForm({ onStart, expandButton, isFull }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [createSession, { data, isLoading }] =
    api.endpoints.createNewSession.useMutation();
  const { data: metaData } = api.endpoints.getAgentMetadata.useQuery();
  const dispatch = useDispatch();

  // In full mode we split the layout: gradient hero on the left, form on the right
  const inputCls = `w-full bg-gray-100 rounded-lg px-4 text-sm text-gray-700 placeholder-gray-400 mb-3 outline-none focus:ring-2 focus:ring-pink-300 transition ${isFull ? "py-3" : "py-2.5"}`;
  const saveChatSession = useCallback(async () => {
    name.trim() && onStart({ name, phone, email });
    // Save to API and to cookie or any storage that can config with expiry
    const session = await createSession({ name, email, phone }).unwrap();

    dispatch(setChatIdentity({ sessionId: session.id }));
  }, [name, email, phone, dispatch]);
  if (isFull) {
    return (
      <div className="flex flex-col h-full">
        <ChatHeader rightSlot={expandButton} isFull />

        {/* Hero band */}
        <div
          className="px-6 py-5 flex-shrink-0"
          style={{ background: GRADIENT }}
        >
          <p className="text-white text-base leading-relaxed font-medium">
            {metaData?.description}
          </p>
          <p className="text-pink-100 text-sm leading-relaxed mt-1">
            I am here to answer questions and help you with any other requests.
          </p>
        </div>

        {/* Centred form card with generous whitespace */}
        <div className="flex-1 bg-gray-50 flex items-start justify-center px-8 py-8 overflow-y-auto">
          <div
            className="bg-white rounded-2xl shadow-md px-8 py-7 w-full"
            style={{ maxWidth: 480 }}
          >
            <p className="text-gray-600 text-sm mb-5 leading-snug">
              We need to collect some information in case we lose you
            </p>
            {[
              {
                placeholder: "Your Name",
                value: name,
                setter: setName,
                type: "text",
              },
              {
                placeholder: "Your Phone Number",
                value: phone,
                setter: setPhone,
                type: "tel",
              },
              {
                placeholder: "Your Email Address",
                value: email,
                setter: setEmail,
                type: "email",
              },
            ].map(({ placeholder, value, setter, type }) => (
              <input
                key={placeholder}
                type={type}
                className={inputCls}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
              />
            ))}
            <button
              disabled={isLoading}
              onClick={async () => {
                await saveChatSession();
              }}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-75 mt-2"
              style={{ background: "linear-gradient(90deg, #f05a7e, #e8184e)" }}
            >
              Start Conversation
              {isLoading && <AppSpinner />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader rightSlot={expandButton} />
      <div className="px-5 py-4 flex-shrink-0" style={{ background: GRADIENT }}>
        <p className="text-white text-sm leading-relaxed">
          {metaData?.description}
        </p>
        <p className="text-white text-sm leading-relaxed mt-1.5">
          I am here to answer questions and help you with any other requests.
        </p>
      </div>
      <div className="flex-1 bg-gray-50 px-4 pt-5 pb-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-md px-5 py-5">
          <p className="text-gray-600 text-sm mb-4 leading-snug">
            We need to collect some information in case we lose you
          </p>
          {[
            {
              placeholder: "Your Name",
              value: name,
              setter: setName,
              type: "text",
            },
            {
              placeholder: "Your Phone Number",
              value: phone,
              setter: setPhone,
              type: "tel",
            },
            {
              placeholder: "Your Email Address",
              value: email,
              setter: setEmail,
              type: "email",
            },
          ].map(({ placeholder, value, setter, type }) => (
            <input
              key={placeholder}
              type={type}
              className={inputCls}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setter(e.target.value)}
            />
          ))}
          <button
            onClick={async () => await saveChatSession()}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-75 mt-1"
            style={{ background: "linear-gradient(90deg, #f05a7e, #e8184e)" }}
          >
            Start Conversation
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Home ───────────────────────────────────────────────────────────

function HomeScreen({
  onStart,
  onContinue,
  onTopicSelect,
  hasHistory,
  expandButton,
  isFull,
}) {
  const hasConversationId = localStorage.getItem("EGGROUP_CONVO_ID");

  const chatStore = useSelector((state: RootState) => state.chat) as ChatState;

  const cards = useMemo(() => {
    const select = [];
    if (chatStore.currentConversationId) {
      select.push({
        label: "Continue Conversation",
        sub: "Pick up where you left off",
        onClick: onContinue,
        icon: (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      });
    } else {
      select.push({
        label: "Start Conversation",
        sub: "Send us a message",
        onClick: onStart,
        icon: (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        ),
      });
    }
    return select;
  }, [chatStore.currentConversationId]);
  const { data: metaData } = api.endpoints.getAgentMetadata.useQuery();

  return (
    <div className="flex flex-col h-full">
      <ChatHeader rightSlot={expandButton} isFull={isFull} />

      <div
        className={`flex-shrink-0 ${isFull ? "px-6 py-5" : "px-5 py-4"}`}
        style={{ background: GRADIENT }}
      >
        <p
          className={`text-white leading-relaxed ${isFull ? "text-base font-medium" : "text-sm"}`}
        >
          {/* Hi! I'm Baaba, you can call me Babs. */}
          {metaData?.description ?? '-'}
        </p>
        <p
          className={`leading-relaxed mt-1.5 ${isFull ? "text-pink-100 text-sm" : "text-white text-sm"}`}
        >
          I am here to answer questions and help you with any other requests.
        </p>
      </div>

      <div
        className={`flex-1 bg-gray-50 flex flex-col gap-3 overflow-y-auto ${isFull ? "px-8 py-7" : "px-4 py-5"}`}
      >
        <div
          className={`w-full flex flex-col gap-3 ${isFull ? "max-w-lg" : ""}`}
        >
          {cards.map(({ label, sub, onClick, icon }) => (
            <button
              key={label}
              onClick={onClick}
              className={`w-full bg-white rounded-2xl shadow flex items-center justify-between hover:shadow-md transition text-left ${isFull ? "px-6 py-5" : "px-5 py-4"}`}
            >
              <div className="min-w-0 mr-3">
                <p
                  className={`font-semibold text-gray-800 ${isFull ? "text-base" : "text-sm"}`}
                >
                  {label}
                </p>
                <p
                  className={`text-gray-400 mt-0.5 ${isFull ? "text-sm" : "text-xs"}`}
                >
                  {sub}
                </p>
              </div>
              <div
                className={`rounded-full flex items-center justify-center flex-shrink-0 ${isFull ? "w-12 h-12" : "w-10 h-10"}`}
                style={{ background: GRADIENT_BTN }}
              >
                {icon}
              </div>
            </button>
          ))}
        </div>

        <div className={`w-full flex flex-col ${isFull ? "max-w-lg gap-5" : "gap-4"}`}>
          <div>
            <p className={`font-semibold text-gray-800 ${isFull ? "text-base" : "text-sm"}`}>
              Quick Questions
            </p>
            <p className={`text-gray-500 mt-1 ${isFull ? "text-sm" : "text-xs"}`}>
              Pick a topic and send it as a new message.
            </p>
          </div>

          {QUICK_QUESTION_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-2.5">
              <p className={`font-semibold text-gray-700 ${isFull ? "text-sm" : "text-xs uppercase tracking-[0.14em]"}`}>
                {group.title}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => onTopicSelect(item.prompt)}
                    className={`rounded-2xl border border-pink-100 bg-white px-2 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow ${isFull ? "min-h-10" : "min-h-10"}`}
                  >
                    <p className={`font-semibold text-gray-800 ${isFull ? "text-sm" : "text-xs"}`}>
                      {item.label}
                    </p>
                    {/* <p className={`mt-1.5 text-gray-500 leading-relaxed ${isFull ? "text-sm" : "text-xs"}`}>
                      {item.prompt}
                    </p> */}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Chat ───────────────────────────────────────────────────────────

function ChatScreen({
  onBack,
  autoSubmitText,
  onAutoSubmitComplete,
  expandButton,
  isFull,
  userName,
  ...props
}: {
  onBack?: () => void;
  autoSubmitText?: string | null;
  onAutoSubmitComplete?: () => void;
  expandButton?: any;

  isFull?: boolean;
  userName?: any;

  // Added by Abdulmalik Copied From FOUNDRY DEMO CHAT
  //   messages:  IChatItem[];
  // status: typeof initialAppState
  //         error={chat.error}
} & ChatInterfaceProps) {
  const {
    messages,
    status,
    error,
    streamingMessageId,
    onSendMessage,
    onMcpApproval,
    onClearError,
    onOpenSettings,
    onNewChat,
    onCancelStream,
    hasMessages,
    disabled,
    agentName,
    agentDescription,
    agentLogo,
    starterPrompts,
    conversationId,
    getAccessToken,
    apiUrl,
  } = props;

  // const [messages, setMessages] = useState([
  //   { id: 1, from: "bot", type: "text", text: BOT_INTRO[0] },
  //   { id: 2, from: "bot", type: "text", text: BOT_INTRO[1] },
  //   {
  //     id: 3,
  //     from: "bot",
  //     type: "options",
  //     text: BOT_INTRO[2],
  //     options: QUICK_OPTIONS,
  //   },
  // ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const responseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Create a RTK mutation that can create a new user session and perists its in localstorage;

  useEffect(() => {
    return () => {
      if (responseTimerRef.current != null) {
        clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  // In full mode messages sit in a centred column so they don't stretch across 683px
  const msgColCls = isFull
    ? "flex-1 overflow-y-auto bg-gray-50 px-8 py-5 space-y-4"
    : "flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-3";

  const botBubbleWidth = isFull ? "max-w-md" : ""; // cap bot bubble width in full mode
  const userBubbleWidth = isFull ? "max-w-md" : "max-w-sm";
  const avatarSize = isFull ? 30 : 26;
  const pillText = isFull ? "text-sm" : "text-xs";
  const isStreaming = status === "streaming";
  const isBusy = disabled || status === "sending" || status === "streaming";
  const [liveRegionMessage, setLiveRegionMessage] = useState<string>("");

  // Announce streaming status changes to screen readers
  useEffect(() => {
    if (isStreaming) {
      setLiveRegionMessage("Assistant is responding");
    } else if (
      status === "idle" &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "assistant"
    ) {
      setLiveRegionMessage("Response complete");
      // Clear the message after announcement
      const timer = setTimeout(() => setLiveRegionMessage(""), 1000);
      return () => clearTimeout(timer);
    }
  }, [isStreaming, status, messages]);

  const handleSendMessage = (messageText: string, files?: File[]) => {
    if (!messageText.trim() || disabled) return;
    onSendMessage(messageText, files);
  };

  const handleStarterPromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        showBack
        onBack={onBack}
        rightSlot={expandButton}
        isFull={isFull}
      />
      <div className={msgColCls}>
        <div aria-live="polite" aria-atomic="false" className="sr-only">
          {messages.length > 0 &&
            messages[messages.length - 1].role === "assistant" &&
            `Assistant: ${messages[messages.length - 1].content.substring(0, 100)}`}
        </div>
        {messages.map((message) =>
          message.role === "approval" ? (
            <p key={message.id}>Require MCP Approval</p>
          ) : message.role === "user" ? (
            <UserMessage key={message.id} message={message} />
          ) : (
            <AssistantMessage
              key={message.id}
              message={message}
              isStreaming={isStreaming && message.id === streamingMessageId}
              agentName={agentName}
              agentLogo={agentLogo}
            />
          ),
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <ChatInput
        onSubmit={handleSendMessage}
        autoSubmitText={autoSubmitText}
        onAutoSubmitComplete={onAutoSubmitComplete}
      />
    </div>
  );
}

// ─── Launcher bubble ──────────────────────────────────────────────────────────

function LauncherBubble({ onClick, isOpen }) {
  return (
    <button
      onClick={onClick}
      className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
      style={{ background: GRADIENT }}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
    </button>
  );
}

// ─── Root widget ──────────────────────────────────────────────────────────────

export default function FAQSComponent() {
  const { w: vw, h: vh } = useViewport();
  const [open, setOpen] = useState(false);
  const [sizeMode, setSizeMode] = useState("normal");
  const [screen, setScreen] = useState<"form" | "home" | "chat">("form");
  const [hasHistory, setHasHistory] = useState(false);
  const [userData, setUserData] = useState(null);
  const [pendingAutoPrompt, setPendingAutoPrompt] = useState<string | null>(null);
  const previewMessages = useMemo(() => generatePreviewMessages(10), []);

  const chatStore = useSelector((state: RootState) => state.chat) as ChatState;
  const isFull = sizeMode === "full";

  // Which state sequence to use depends on the current viewport width
  const states = vw <= SMALL_SCREEN_BREAKPOINT ? STATES_FULL : STATES_LARGE;

  const cycleSize = useCallback(() => {
    setSizeMode((prev) => {
      const seq = vw <= SMALL_SCREEN_BREAKPOINT ? STATES_FULL : STATES_LARGE;
      // If current mode is "mid" but we just switched to a small screen,
      // normalise back to "normal" before cycling.
      const safeIdx = seq.indexOf(prev) === -1 ? 0 : seq.indexOf(prev);
      return seq[(safeIdx + 1) % seq.length];
    });
  }, [vw]);

  // Derive next mode for icon hint
  const nextMode = (() => {
    const safeIdx =
      states.indexOf(sizeMode) === -1 ? 0 : states.indexOf(sizeMode);
    return states[(safeIdx + 1) % states.length];
  })();

  /**
   * Window sizing strategy
   * ─────────────────────
   * normal  →  350 × 540 px  (compact widget)
   * mid     →  500 × 660 px  (comfortable widget)
   * full    →  exactly 50vw wide, exactly 100vh tall
   *            flushed to right & top edges — no gap, no border-radius on edges
   *
   * For 1366×768 this gives 683 × 768 px — a proper half-screen panel.
   */
  const windowStyle = (() => {
    if (sizeMode === "normal") return { width: 350, height: 540 };
    if (sizeMode === "mid") return { width: 500, height: 660 };
    return {
      position: "fixed" as const,
      top: 0,
      right: 0,
      bottom: 0,
      width: "50vw",
      height: "100vh",
      // Remove rounding on edges that touch the viewport boundary
      borderRadius: 0,
    };
  })();

  // In full mode the window is already fixed — the launcher floats separately
  const launcherStyle = isFull
    ? { position: "fixed" as const, bottom: 24, right: 24, zIndex: 51 }
    : {};

  const expandButton = (
    <button
      onClick={cycleSize}
      title={
        nextMode === "full"
          ? "Half viewport"
          : nextMode === "mid"
            ? "Expand"
            : "Restore"
      }
      className="w-7 h-7 rounded-full flex items-center justify-center text-white bg-white/20 hover:bg-white/35 transition ml-1 flex-shrink-0"
    >
      <CycleExpandIcon nextMode={nextMode} />
    </button>
  );

  const screenProps = { expandButton, isFull };
  const apiUrl = import.meta.env.VITE_API_URL || baseURL0; // "https://enterprise-group-backend-bgg0caceakebd2fj.eastus-01.azurewebsites.net";
  const { data: metaData } = api.endpoints.getAgentMetadata.useQuery();
  const dispatch = useDispatch<AppDispatch>();
  const [createSession, { data, isLoading }] =
    api.endpoints.createNewSession.useMutation();

  useEffect(() => {
    if (chatStore.currentSessionId) setScreen("home");
  }, [chatStore.currentSessionId]);

  const handleQuickQuestionSelect = useCallback((prompt: string) => {
    setPendingAutoPrompt(prompt);
    setHasHistory(true);
    setScreen("chat");
  }, []);

  return (
    <>
      {/* Chat window */}
      <div
        className={`fixed z-50 bg-white shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
          !isFull ? "rounded-3xl origin-bottom-right bottom-[88px] right-6" : ""
        } ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}`}
        style={windowStyle}
      >
        {screen === "form" && (
          <PreChatForm
            onStart={(data) => {
              // await  createSession(data as any).unwrap();

              setUserData(data);
              setScreen("home");
            }}
            {...screenProps}
          />
        )}
        {screen === "home" && (
          <HomeScreen
            onStart={() => {
              setScreen("chat");
              setHasHistory(true);
            }}
            onContinue={() => setScreen("chat")}
            onTopicSelect={handleQuickQuestionSelect}
            hasHistory={hasHistory}
            {...screenProps}
          />
        )}
        {screen === "chat" && (
          <ChatScreen
            messages={
              chatStore.messages.length > 0
                ? chatStore.messages
                : [] //previewMessages
            }
            status={chatStore.status}
            error={chatStore.error}
            onSendMessage={(text: string, files?: File[]) => {
              const sessionId = chatStore.currentSessionId;//localStorage.getItem("EGGROUP_SESSION_ID");
              if (!sessionId) {
                return;
              }

              dispatch(
                sendMessageThunk({
                  apiUrl,
                  getAccessToken: async () => `Bearer [ABCD]`,
                  messageText: text,
                  sessionId: chatStore.currentSessionId,
                  currentConversationId: chatStore.currentConversationId,
                    // "conv_ec1933ca0c9839b100XdfcnDGbfozBRCoduf7vTeR0X2B51yvK", // ?? chatStore.currentConversationId,
                  files,
                }),
              );
            }}
            conversationId={chatStore.currentConversationId}
            disabled={false}
            onBack={() => setScreen("home")}
            autoSubmitText={pendingAutoPrompt}
            onAutoSubmitComplete={() => setPendingAutoPrompt(null)}
            userName={userData?.name}
            agentDescription={metaData?.description ?? "EG Quick Agent"}
            hasMessages={chatStore.messages.length > 0}
            agentName={metaData?.name}
            apiUrl={apiUrl}
            {...screenProps}
          />
        )}
      </div>

{console.log(chatStore?.messages, 'CHAT_SOTREA_MESSAGES')}
      {/* Launcher — always on top, always at bottom-right */}
      <div
        className={!isFull ? "fixed bottom-6 right-6 z-50" : ""}
        style={isFull ? launcherStyle : {}}
      >
        <LauncherBubble onClick={() => setOpen((v) => !v)} isOpen={open} />
      </div>
    </>
  );
}
