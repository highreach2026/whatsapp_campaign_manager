"use client";

import { useEffect, useRef, useState } from "react";

/* ----------------------------------------------------------------
   Types
---------------------------------------------------------------- */
interface Message {
  role: "user" | "bot";
  text: string;
  id: number;
}

/* ----------------------------------------------------------------
   Minimal markdown → HTML renderer (bold, lists, newlines)
---------------------------------------------------------------- */
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>(\n|$))+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n/g, "<br />");
}

/* ----------------------------------------------------------------
   All 15 topic questions — icon + label + the actual query sent
---------------------------------------------------------------- */
const TOPICS = [
  { icon: "🏢", label: "What is HighReach?",                 query: "What is HighReach?" },
  { icon: "📢", label: "How do WhatsApp campaigns work?",    query: "How do WhatsApp campaigns work?" },
  { icon: "📋", label: "How do I import contacts?",          query: "How do I import contacts?" },
  { icon: "✅", label: "How does opt-in work?",              query: "How does opt-in work?" },
  { icon: "🚫", label: "How does opt-out / STOP work?",      query: "How does opt-out work?" },
  { icon: "📝", label: "What message templates are used?",   query: "What templates are supported?" },
  { icon: "🎨", label: "Can I attach images or videos?",     query: "Can I attach media to campaigns?" },
  { icon: "📊", label: "How does delivery tracking work?",   query: "How does analytics and delivery tracking work?" },
  { icon: "📞", label: "How are phone numbers handled?",     query: "How are Indian phone numbers normalised?" },
  { icon: "💰", label: "What is the pricing?",               query: "What is the pricing?" },
  { icon: "🔐", label: "Is my data secure?",                 query: "How does HighReach handle security?" },
  { icon: "🗄️", label: "What database does it use?",         query: "What database does HighReach use?" },
  { icon: "⚙️", label: "How do I set it up?",                query: "How do I set up and get started?" },
  { icon: "🔗", label: "How do webhooks work?",              query: "How do webhooks work?" },
  { icon: "📨", label: "How many messages can I send?",      query: "What is the send limit or recipient cap?" },
];

/* ----------------------------------------------------------------
   Chatbot Component
---------------------------------------------------------------- */
export default function Chatbot() {
  const [open, setOpen] = useState(false);
  /* "topics" = show topic grid; "chat" = show conversation */
  const [view, setView] = useState<"topics" | "chat">("topics");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgIdCounter, setMsgIdCounter] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* scroll to bottom on new message */
  useEffect(() => {
    if (open && view === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, view]);

  /* focus input when chat view opens */
  useEffect(() => {
    if (open && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open, view]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsgId = msgIdCounter;
    setMsgIdCounter((n) => n + 2);
    setInput("");
    setView("chat");
    setMessages((prev) => [...prev, { role: "user", text: trimmed, id: userMsgId }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.reply || data.error || "Sorry, something went wrong.",
          id: userMsgId + 1,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Network error. Please check your connection and try again.", id: userMsgId + 1 },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleOpen() {
    setOpen((v) => !v);
  }

  function goBackToTopics() {
    setView("topics");
  }

  return (
    <>
      {/* ── Floating bubble ── */}
      <button
        id="chatbot-toggle"
        className={`chatbotBubble ${open ? "chatbotBubbleActive" : ""}`}
        onClick={handleOpen}
        aria-label="Open HighReach Assistant"
        title="Ask HighReach Assistant"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
            <path d="M7 9h10M7 13h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        )}
        {!open && <span className="chatbotPulse" />}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div className="chatbotWindow" id="chatbot-window" role="dialog" aria-label="HighReach Assistant">

          {/* Header */}
          <div className="chatbotHeader">
            <div className="chatbotHeaderAvatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <div className="chatbotHeaderInfo">
              <strong>HighReach Assistant</strong>
              <span>Services support · Always available</span>
            </div>
            {/* Back button — visible only in chat view when there are messages */}
            {view === "chat" && messages.length > 0 && (
              <button
                className="chatbotBackBtn"
                onClick={goBackToTopics}
                type="button"
                title="Browse all topics"
                aria-label="Back to topics"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Topics
              </button>
            )}
            <div className="chatbotOnlineDot" title="Online" />
          </div>

          {/* ══════════════════════════════════════
              VIEW A — Topics Grid
          ══════════════════════════════════════ */}
          {view === "topics" && (
            <div className="chatbotTopicsView">
              <div className="chatbotTopicsIntro">
                <p>👋 Hi! I'm the <strong>HighReach Assistant</strong>.</p>
                <p className="chatbotTopicsSubtitle">Tap any question below to get an instant answer — or type your own.</p>
              </div>

              <div className="chatbotTopicGrid">
                {TOPICS.map((t) => (
                  <button
                    key={t.query}
                    className="chatbotTopicCard"
                    onClick={() => sendMessage(t.query)}
                    type="button"
                    disabled={loading}
                  >
                    <span className="chatbotTopicIcon">{t.icon}</span>
                    <span className="chatbotTopicLabel">{t.label}</span>
                    <svg className="chatbotTopicArrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              VIEW B — Conversation Chat
          ══════════════════════════════════════ */}
          {view === "chat" && (
            <div className="chatbotMessages" id="chatbot-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`chatbotMsg ${msg.role}`}>
                  {msg.role === "bot" && (
                    <div className="chatbotAvatar">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                      </svg>
                    </div>
                  )}
                  <div
                    className="chatbotBubbleMsg"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                  />
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="chatbotMsg bot">
                  <div className="chatbotAvatar">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                  </div>
                  <div className="chatbotBubbleMsg chatbotTyping">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              {/* After bot reply — show quick topic chips to continue browsing */}
              {!loading && messages.length >= 2 && (
                <div className="chatbotQuickChips">
                  <span className="chatbotQuickLabel">Ask another question:</span>
                  <div className="chatbotChipRow">
                    {TOPICS.filter((t) => !messages.some((m) => m.role === "user" && m.text === t.query))
                      .slice(0, 4)
                      .map((t) => (
                        <button
                          key={t.query}
                          className="chatbotChip"
                          onClick={() => sendMessage(t.query)}
                          type="button"
                        >
                          {t.icon} {t.label}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}

          {/* Input — always visible */}
          <div className="chatbotInputRow">
            <input
              ref={inputRef}
              id="chatbot-input"
              type="text"
              className="chatbotInput"
              placeholder={view === "topics" ? "Or type your question…" : "Ask about HighReach services…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              maxLength={500}
              autoComplete="off"
            />
            <button
              id="chatbot-send"
              className="chatbotSend"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              type="button"
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>

          <div className="chatbotFooter">Powered by HighReach · Services queries only</div>
        </div>
      )}
    </>
  );
}
