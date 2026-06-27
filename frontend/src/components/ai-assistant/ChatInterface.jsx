// src/components/ai/ChatInterface.jsx


import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import axiosInstance from '../../utils/axiosInstance';

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: 'Namaste 🙏 I am your AgriConnect AI assistant.\n\nYou can ask me about:\n• Crop selection & sowing dates\n• Fertilizer & pesticide advice\n• Mandi prices & selling tips\n• Government schemes eligibility\n\nHow can I help you today?',
  timestamp: new Date().toISOString(),
};

export default function ChatInterface({ compact = false }) {
  const [messages, setMessages]   = useState([WELCOME_MESSAGE]);
  const [input,    setInput]      = useState('');
  const [loading,  setLoading]    = useState(false);
  const bottomRef                 = useRef(null);
  const inputRef                  = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Send message ──────────────────────────────────────────

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // POST /api/v1/ai/chat  → { data: { reply: "..." } }
      const { data } = await axiosInstance.post('/v1/ai/chat', {
        message: text,
        // Send last 6 messages as history context (excluding welcome)
        history: messages.slice(-6).map((m) => ({ role: m.role, content: m.text })),
      });

      const assistantMsg = {
        role:      'assistant',
        text:      data.data?.reply ?? 'Sorry, I could not get a response.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg = {
        role:      'assistant',
        text:      '⚠️ ' + (err.response?.data?.message ?? 'Network error. Please try again.'),
        timestamp: new Date().toISOString(),
        isError:   true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Suggested prompts (shown when only welcome msg exists) ──

  const suggestions = [
    'Which crops are best for June in UP?',
    'What is the MSP for wheat this year?',
    'How to treat yellow rust in wheat?',
    'Am I eligible for PM-KISAN?',
  ];

  const containerCls = compact
    ? 'flex flex-col h-full'
    : 'flex flex-col h-screen max-h-screen bg-gray-50';

  return (
    <div className={containerCls}>

      {/* Header */}
      {!compact && (
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3 shadow-sm flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-lg">🌿</div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">AgriConnect AI</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Online
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-sm flex-shrink-0">🌿</div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions (only when conversation is fresh) */}
        {messages.length === 1 && !loading && (
          <div className="pt-2">
            <p className="text-xs text-gray-400 mb-2 px-1">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200
                             rounded-full px-3 py-1.5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-2 flex-shrink-0">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about farming…"
          className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                     max-h-28 overflow-y-auto"
          style={{ fieldSizing: 'content' }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl bg-green-600 hover:bg-green-700
                     disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center justify-center text-white transition-colors flex-shrink-0"
          aria-label="Send"
        >
          <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
