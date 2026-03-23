import { useState, useRef, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_OPTIONS = [
  "Enquiry", "Schedule Arrears", "Make a Claim", "Complaint",
  "Amendments", "Buy Policy", "Products Information",
  "Deceased Pickup (Funeral Services)", "Make Payment", "Property Services",
];

const BOT_INTRO = [
  "Hi, I am Babs and here to assist.",
  "You can request human help at anytime when you need more clarification to your questions.",
  "For now, I have these options for you to choose from.\nYou can ask me to show you this menu any time.",
];

const GRADIENT = "linear-gradient(135deg, #e8184e 0%, #c0396b 60%, #8b2fc9 100%)";
const GRADIENT_BTN = "linear-gradient(135deg, #8b2fc9, #c0396b)";
const GRADIENT_USER = "linear-gradient(135deg, #e8184e, #8b2fc9)";

// On screens ≤ 1366 px wide the "mid" step is skipped — the button jumps
// straight from normal to the half-viewport full panel.
const SMALL_SCREEN_BREAKPOINT = 1366;
const STATES_FULL = ["normal", "full"];          // ≤ 1366 px
const STATES_LARGE = ["normal", "mid", "full"];   // > 1366 px

// ─── Viewport hook ────────────────────────────────────────────────────────────

function useViewport() {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const handler = () => setVp({ w: window.innerWidth, h: window.innerHeight });
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
  if (nextMode === "full") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      {/* two side-by-side panes — communicates "half viewport" */}
      <rect x="2" y="3" width="9" height="18" rx="1.5" />
      <rect x="13" y="3" width="9" height="18" rx="1.5" />
    </svg>
  );
  // Will expand to mid
  if (nextMode === "mid") return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
  // Will restore to normal
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
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

function ChatHeader({ showBack, onBack, rightSlot, isFull }: { showBack?: boolean; onBack?: () => void; rightSlot?: any; isFull?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 flex-shrink-0 ${isFull ? "px-6 py-4" : "px-4 py-3"}`}
      style={{ background: GRADIENT }}
    >
      {showBack && (
        <button onClick={onBack} className="text-white p-1 hover:opacity-75 transition -ml-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <Avatar size={isFull ? 44 : 38} />
      <div className="flex-1 min-w-0">
        <p className={`text-white font-bold leading-tight ${isFull ? "text-base" : "text-sm"}`}>Babs</p>
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

  // In full mode we split the layout: gradient hero on the left, form on the right
  const inputCls = `w-full bg-gray-100 rounded-lg px-4 text-sm text-gray-700 placeholder-gray-400 mb-3 outline-none focus:ring-2 focus:ring-pink-300 transition ${isFull ? "py-3" : "py-2.5"}`;

  if (isFull) {
    return (
      <div className="flex flex-col h-full">
        <ChatHeader rightSlot={expandButton} isFull />

        {/* Hero band */}
        <div className="px-6 py-5 flex-shrink-0" style={{ background: GRADIENT }}>
          <p className="text-white text-base leading-relaxed font-medium">Hi! I'm Baaba, you can call me Babs.</p>
          <p className="text-pink-100 text-sm leading-relaxed mt-1">
            I am here to answer questions and help you with any other requests.
          </p>
        </div>

        {/* Centred form card with generous whitespace */}
        <div className="flex-1 bg-gray-50 flex items-start justify-center px-8 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-md px-8 py-7 w-full" style={{ maxWidth: 480 }}>
            <p className="text-gray-600 text-sm mb-5 leading-snug">
              We need to collect some information in case we lose you
            </p>
            {[
              { placeholder: "Your Name", value: name, setter: setName, type: "text" },
              { placeholder: "Your Phone Number", value: phone, setter: setPhone, type: "tel" },
              { placeholder: "Your Email Address", value: email, setter: setEmail, type: "email" },
            ].map(({ placeholder, value, setter, type }) => (
              <input key={placeholder} type={type} className={inputCls}
                placeholder={placeholder} value={value}
                onChange={(e) => setter(e.target.value)} />
            ))}
            <button
              onClick={() => name.trim() && onStart({ name, phone, email })}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 active:opacity-75 mt-2"
              style={{ background: "linear-gradient(90deg, #f05a7e, #e8184e)" }}
            >
              Start Conversation
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
        <p className="text-white text-sm leading-relaxed">Hi! I'm Baaba, you can call me Babs.</p>
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
            { placeholder: "Your Name", value: name, setter: setName, type: "text" },
            { placeholder: "Your Phone Number", value: phone, setter: setPhone, type: "tel" },
            { placeholder: "Your Email Address", value: email, setter: setEmail, type: "email" },
          ].map(({ placeholder, value, setter, type }) => (
            <input key={placeholder} type={type} className={inputCls}
              placeholder={placeholder} value={value}
              onChange={(e) => setter(e.target.value)} />
          ))}
          <button
            onClick={() => name.trim() && onStart({ name, phone, email })}
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

function HomeScreen({ onStart, onContinue, hasHistory, expandButton, isFull }) {
  const cards = [
    {
      label: "Start Conversation",
      sub: "Send us a message",
      onClick: onStart,
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      ),
    },
    hasHistory && {
      label: "Continue Conversation",
      sub: "Pick up where you left off",
      onClick: onContinue,
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ].filter(Boolean);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader rightSlot={expandButton} isFull={isFull} />

      <div className={`flex-shrink-0 ${isFull ? "px-6 py-5" : "px-5 py-4"}`} style={{ background: GRADIENT }}>
        <p className={`text-white leading-relaxed ${isFull ? "text-base font-medium" : "text-sm"}`}>
          Hi! I'm Baaba, you can call me Babs.
        </p>
        <p className={`leading-relaxed mt-1.5 ${isFull ? "text-pink-100 text-sm" : "text-white text-sm"}`}>
          I am here to answer questions and help you with any other requests.
        </p>
      </div>

      <div className={`flex-1 bg-gray-50 flex flex-col gap-3 overflow-y-auto ${isFull ? "px-8 py-7" : "px-4 py-5"}`}>
        <div className={`w-full flex flex-col gap-3 ${isFull ? "max-w-lg" : ""}`}>
          {cards.map(({ label, sub, onClick, icon }) => (
            <button
              key={label}
              onClick={onClick}
              className={`w-full bg-white rounded-2xl shadow flex items-center justify-between hover:shadow-md transition text-left ${isFull ? "px-6 py-5" : "px-5 py-4"}`}
            >
              <div className="min-w-0 mr-3">
                <p className={`font-semibold text-gray-800 ${isFull ? "text-base" : "text-sm"}`}>{label}</p>
                <p className={`text-gray-400 mt-0.5 ${isFull ? "text-sm" : "text-xs"}`}>{sub}</p>
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
      </div>
    </div>
  );
}

// ─── Screen 3: Chat ───────────────────────────────────────────────────────────

function ChatScreen({ onBack, expandButton, isFull, userName }: { onBack?: () => void; expandButton?: any; isFull?: boolean; userName?: any }) {
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", type: "text", text: BOT_INTRO[0] },
    { id: 2, from: "bot", type: "text", text: BOT_INTRO[1] },
    { id: 3, from: "bot", type: "options", text: BOT_INTRO[2], options: QUICK_OPTIONS },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const responseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (responseTimerRef.current != null) {
        clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim()) return;
      if (responseTimerRef.current != null) {
        clearTimeout(responseTimerRef.current);
      }

      setMessages((prev) => [...prev, { id: Date.now(), from: "user", type: "text", text }]);
      setInput("");

      responseTimerRef.current = window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            from: "bot",
            type: "text",
            text: `Thank you for your message about "${text}". A representative will be with you shortly.`,
          },
        ]);
        responseTimerRef.current = null;
      }, 900);
    },
    [setInput, setMessages]
  );

  // In full mode messages sit in a centred column so they don't stretch across 683px
  const msgColCls = isFull
    ? "flex-1 overflow-y-auto bg-gray-50 px-8 py-5 space-y-4"
    : "flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-3";

  const botBubbleWidth = isFull ? "max-w-md" : "";   // cap bot bubble width in full mode
  const userBubbleWidth = isFull ? "max-w-md" : "max-w-sm";
  const avatarSize = isFull ? 30 : 26;
  const pillText = isFull ? "text-sm" : "text-xs";

  return (
    <div className="flex flex-col h-full">
      <ChatHeader showBack onBack={onBack} rightSlot={expandButton} isFull={isFull} />

      <div className={msgColCls}>
        {messages.map((msg) =>
          msg.from === "bot" ? (
            <div key={msg.id} className={`flex items-end gap-2 ${botBubbleWidth}`}>
              <Avatar size={avatarSize} />
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                  <p className={`text-gray-800 whitespace-pre-line leading-relaxed ${isFull ? "text-sm" : "text-sm"}`}>
                    {msg.text}
                  </p>
                </div>
                {msg.type === "options" && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => sendMessage(opt)}
                        className={`text-white font-medium rounded-full transition hover:opacity-85 active:scale-95 ${pillText} ${isFull ? "px-4 py-2" : "px-3 py-1.5"}`}
                        style={{ background: GRADIENT_USER }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-end">
              <div
                className={`px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm ${userBubbleWidth}`}
                style={{ background: GRADIENT_USER }}
              >
                <p className="text-white text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className={`bg-white border-t border-gray-100 flex items-center gap-3 flex-shrink-0 ${isFull ? "px-8 py-4" : "px-4 py-3"}`}>
        <input
          className={`flex-1 bg-gray-100 rounded-full text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-pink-200 transition min-w-0 ${isFull ? "px-5 py-3 text-sm" : "px-4 py-2.5 text-sm"}`}
          placeholder="Type your message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
        />
        <button
          onClick={() => sendMessage(input)}
          className={`rounded-full flex items-center justify-center transition hover:opacity-85 active:scale-95 flex-shrink-0 ${isFull ? "w-11 h-11" : "w-9 h-9"}`}
          style={{ background: GRADIENT_USER }}
        >
          <SendIcon />
        </button>
      </div>
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const [screen, setScreen] = useState("form");
  const [hasHistory, setHasHistory] = useState(false);
  const [userData, setUserData] = useState(null);

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
    const safeIdx = states.indexOf(sizeMode) === -1 ? 0 : states.indexOf(sizeMode);
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
      title={nextMode === "full" ? "Half viewport" : nextMode === "mid" ? "Expand" : "Restore"}
      className="w-7 h-7 rounded-full flex items-center justify-center text-white bg-white/20 hover:bg-white/35 transition ml-1 flex-shrink-0"
    >
      <CycleExpandIcon nextMode={nextMode} />
    </button>
  );

  const screenProps = { expandButton, isFull };

  return (
    <>
      {/* Chat window */}
      <div
        className={`fixed z-50 bg-white shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${!isFull ? "rounded-3xl origin-bottom-right bottom-[88px] right-6" : ""
          } ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}`}
        style={windowStyle}
      >
        {screen === "form" && (
          <PreChatForm onStart={(data) => { setUserData(data); setScreen("home"); }} {...screenProps} />
        )}
        {screen === "home" && (
          <HomeScreen
            onStart={() => { setScreen("chat"); setHasHistory(true); }}
            onContinue={() => setScreen("chat")}
            hasHistory={hasHistory}
            {...screenProps}
          />
        )}
        {screen === "chat" && (
          <ChatScreen onBack={() => setScreen("home")} userName={userData?.name} {...screenProps} />
        )}
      </div>

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