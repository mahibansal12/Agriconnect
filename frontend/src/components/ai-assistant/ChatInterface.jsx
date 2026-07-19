import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import axiosInstance from '../../utils/axiosInstance';
import useAuth from '../../hooks/useAuth';

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: 'Namaste 🙏 I am your AgriConnect AI assistant.\n\nYou can ask me about:\n• Crop selection & sowing dates\n• Fertilizer & pesticide advice\n• Mandi prices & selling tips\n• Government schemes eligibility\n\nHow can I help you today?',
  timestamp: new Date().toISOString(),
};

const FEATURE_PILLS = [
  { icon: '🌾', label: 'Crop Advice',       prompt: 'Give me crop advice for my region and current season.' },
  { icon: '🌦️', label: 'Weather',           prompt: 'What is the weather forecast for the next few days?' },
  { icon: '💰', label: 'Mandi Prices',       prompt: 'What are the current mandi prices for major crops?' },
  { icon: '🏛️', label: 'Govt. Schemes',      prompt: 'What government schemes am I eligible for as a farmer?' },
  { icon: '🦠', label: 'Disease Detection', prompt: 'Help me identify a crop disease from its symptoms.' },
  { icon: '💧', label: 'Irrigation',         prompt: 'Give me irrigation tips for my crop.' },
];

const HERO_TOPICS = [
  { icon: '🌾', label: 'Crop recommendations', prompt: 'Recommend crops suitable for my region and season.' },
  { icon: '🧪', label: 'Fertilizers',           prompt: 'Suggest fertilizers for my crop and soil type.' },
  { icon: '🦠', label: 'Disease detection',    prompt: 'Help me identify a crop disease from its symptoms.' },
  { icon: '🏛️', label: 'Government schemes',   prompt: 'What government schemes am I eligible for as a farmer?' },
  { icon: '💰', label: 'Mandi prices',          prompt: 'What are the current mandi prices for major crops?' },
  { icon: '🌦️', label: 'Weather',              prompt: 'What is the weather forecast for the next few days?' },
  { icon: '💧', label: 'Irrigation',            prompt: 'Give me irrigation tips for my crop.' },
  { icon: '📈', label: 'Market trends',         prompt: 'What are the current market trends for crop prices?' },
];

const SUGGESTIONS = [
  { icon: '🌾', text: 'Best crops for June?', desc: 'Get season-wise crop picks for your region' },
  { icon: '💰', text: 'MSP for Wheat', desc: "Check this year's minimum support price" },
  { icon: '🌧️', text: 'Rain forecast', desc: 'Plan irrigation around upcoming weather' },
  { icon: '🐛', text: 'Wheat disease', desc: 'Identify and treat yellow rust & more' },
  { icon: '🏛️', text: 'PM-Kisan eligibility', desc: 'Check scheme eligibility criteria' },
  { icon: '🚜', text: 'Best fertilizer', desc: 'Recommendations for your crop & soil' },
];

export default function ChatInterface() {
  const { name, isLoggedIn } = useAuth();
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── Per-user chat history (left sidebar) ──────────────────────────────
  // Sessions are stored server-side under /v1/ai/sessions, scoped to the
  // logged-in user's own account — nothing here is shared across users or
  // persisted for guests.
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchSessions = async () => {
    if (!isLoggedIn) return;
    try {
      setSessionsLoading(true);
      const { data } = await axiosInstance.get('/v1/ai/sessions');
      setSessions(data?.data || []);
    } catch (err) {
      console.error('Fetch chat sessions error:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchSessions();
    else { setSessions([]); setActiveSessionId(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const loadSession = async (id) => {
    if (id === activeSessionId || loading) return;
    try {
      const { data } = await axiosInstance.get(`/v1/ai/sessions/${id}`);
      const session = data?.data;
      setMessages(session?.messages?.length ? session.messages : [WELCOME_MESSAGE]);
      setActiveSessionId(id);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Load chat session error:', err);
    }
  };

  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setActiveSessionId(null);
    setInput('');
    setSidebarOpen(false);
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat from your history?')) return;
    try {
      await axiosInstance.delete(`/v1/ai/sessions/${id}`);
      setSessions(prev => prev.filter(s => s._id !== id));
      if (id === activeSessionId) handleNewChat();
    } catch (err) {
      console.error('Delete chat session error:', err);
    }
  };

  // Save (or create) the session that backs the current conversation —
  // called after every completed exchange so the sidebar always reflects
  // what's on screen.
  const persistSession = async (msgsToSave) => {
    if (!isLoggedIn) return;
    try {
      if (activeSessionId) {
        const { data } = await axiosInstance.put(`/v1/ai/sessions/${activeSessionId}`, { messages: msgsToSave });
        const updated = data?.data;
        setSessions(prev => {
          const rest = prev.filter(s => s._id !== activeSessionId);
          return [{ _id: activeSessionId, title: updated?.title, updatedAt: updated?.updatedAt }, ...rest];
        });
      } else {
        const { data } = await axiosInstance.post('/v1/ai/sessions', { messages: msgsToSave });
        const created = data?.data;
        if (created?._id) {
          setActiveSessionId(created._id);
          setSessions(prev => [{ _id: created._id, title: created.title, updatedAt: created.updatedAt }, ...prev]);
        }
      }
    } catch (err) {
      console.error('Persist chat session error:', err);
    }
  };

  const formatSessionTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay
      ? d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
      : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-grow the textarea as the user types
  const autoGrow = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };
  useEffect(autoGrow, [input]);

  const sendMessage = async (overrideText, { isRegenerate = false, baseMessages = null } = {}) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    let workingMessages = isRegenerate ? (baseMessages ?? messages) : messages;
    if (!isRegenerate) {
      workingMessages = [...messages, { role: 'user', text, timestamp: new Date().toISOString() }];
      setMessages(workingMessages);
      setInput('');
    }
    setLoading(true);
    try {
      const history = workingMessages.slice(-6).map(m => ({ role: m.role, content: m.text }));
      const { data } = await axiosInstance.post('/v1/ai/chat', { message: text, history });
      const finalMessages = [...workingMessages, {
        role: 'assistant',
        text: data.data?.reply ?? 'Sorry, I could not get a response.',
        timestamp: new Date().toISOString(),
      }];
      setMessages(finalMessages);
      persistSession(finalMessages);
    } catch (err) {
      const finalMessages = [...workingMessages, {
        role: 'assistant',
        text: '⚠️ ' + (err.response?.data?.message ?? 'Network error. Please try again.'),
        timestamp: new Date().toISOString(),
        isError: true,
      }];
      setMessages(finalMessages);
      persistSession(finalMessages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  const handleRegenerate = () => {
    if (loading) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    // drop the last assistant reply, then re-ask the same question
    setMessages(prev => {
      const idx = prev.map(m => m.role).lastIndexOf('assistant');
      const truncated = idx === -1 ? prev : prev.slice(0, idx);
      sendMessage(lastUserMsg.text, { isRegenerate: true, baseMessages: truncated });
      return truncated;
    });
  };

  const handleFeedback = (idx, value) => {
    setMessages(prev => prev.map((m, i) => (i === idx ? { ...m, feedback: value } : m)));
  };

  const lastAssistantIdx = messages.map(m => m.role).lastIndexOf('assistant');
  const showWelcome = messages.length === 1 && !loading;
  const firstName = name?.split(' ')[0];

  return (
    <div className="aic-layout">
      {/* ── Chat history sidebar (per logged-in user) ── */}
      <aside className={`aic-sidebar ${sidebarOpen ? 'aic-sidebar--open' : ''}`}>
        <button type="button" className="aic-newchat-btn" onClick={handleNewChat}>
          <span aria-hidden="true">+</span> New chat
        </button>

        <div className="aic-sidebar-list">
          {!isLoggedIn ? (
            <p className="aic-sidebar-empty">Log in to save and revisit your chat history.</p>
          ) : sessionsLoading ? (
            <p className="aic-sidebar-empty">Loading…</p>
          ) : sessions.length === 0 ? (
            <p className="aic-sidebar-empty">No past chats yet — your conversations will show up here.</p>
          ) : (
            sessions.map(s => (
              <div
                key={s._id}
                className={`aic-session-row ${s._id === activeSessionId ? 'aic-session-row--active' : ''}`}
                onClick={() => loadSession(s._id)}
              >
                <div className="aic-session-info">
                  <span className="aic-session-title">{s.title || 'New chat'}</span>
                  <span className="aic-session-time">{formatSessionTime(s.updatedAt)}</span>
                </div>
                <button
                  type="button"
                  className="aic-session-delete"
                  title="Delete chat"
                  onClick={(e) => handleDeleteSession(s._id, e)}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Backdrop for the sidebar on mobile */}
      {sidebarOpen && <div className="aic-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="aic-wrap">
      {/* Feature pills */}
      <div className="aic-pills">
        <button
          type="button"
          className="aic-sidebar-toggle"
          onClick={() => setSidebarOpen(v => !v)}
          aria-label="Toggle chat history"
        >
          ☰
        </button>
        {FEATURE_PILLS.map(p => (
          <button
            key={p.label}
            type="button"
            className="aic-pill"
            onClick={() => sendMessage(p.prompt)}
            disabled={loading}
          >
            <span aria-hidden="true">{p.icon}</span>{p.label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="aic-scroll">
        {showWelcome && (
          <div className="aic-hero">
            <h2 className="aic-hero-title">
              👋 Namaste{firstName ? ` ${firstName}` : ''}
            </h2>
            <p className="aic-hero-sub">Ask me anything about</p>
            <div className="aic-hero-topics">
              {HERO_TOPICS.map(t => (
                <button
                  key={t.label}
                  type="button"
                  className="aic-hero-topic"
                  onClick={() => sendMessage(t.prompt)}
                  disabled={loading}
                >
                  <span aria-hidden="true">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="aic-messages">
          {messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={msg}
              isLatestAssistant={idx === lastAssistantIdx}
              onCopy={handleCopy}
              onRegenerate={handleRegenerate}
              onFeedback={(v) => handleFeedback(idx, v)}
            />
          ))}

          {loading && (
            <div className="msg-row">
              <div className="msg-avatar msg-avatar--bot">🌱</div>
              <div className="aic-typing">
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {showWelcome && (
            <div className="aic-suggestions">
              <p className="aic-suggestions-label">💡 Try asking</p>
              <div className="aic-suggestions-grid">
                {SUGGESTIONS.map(({ text, icon, desc }) => (
                  <button
                    key={text}
                    type="button"
                    className="aic-suggestion-card"
                    onClick={() => { setInput(text); inputRef.current?.focus(); }}
                  >
                    <span className="aic-suggestion-icon" aria-hidden="true">{icon}</span>
                    <span>
                      <span className="aic-suggestion-text">{text}</span>
                      <span className="aic-suggestion-desc">{desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="aic-input-bar">
        <div className="aic-input-shell">
          <button type="button" className="aic-input-icon" title="Attach file (coming soon)" disabled aria-label="Attach file, coming soon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 12.5l-8.5 8.5a5 5 0 01-7-7l9-9a3.5 3.5 0 015 5l-9 9a2 2 0 01-3-3l8-8" />
            </svg>
          </button>
          <button type="button" className="aic-input-icon" title="Voice input (coming soon)" disabled aria-label="Voice input, coming soon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0014 0M12 18v4" />
            </svg>
          </button>

          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about farming…"
            className="aic-textarea"
          />

          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="aic-send-btn"
            aria-label="Send message"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{ transform: 'rotate(90deg)' }}>
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .aic-layout {
          display: flex; height: 100%; width: 100%;
          position: relative;
        }

        /* Chat history sidebar */
        .aic-sidebar {
          width: 250px; flex-shrink: 0;
          background: #FBFDFB; border-right: 1.5px solid #E5E7EB;
          display: flex; flex-direction: column;
          padding: 14px 12px; gap: 10px;
          height: 100%; overflow-y: auto;
        }
        .aic-newchat-btn {
          display: flex; align-items: center; gap: 8px; justify-content: center;
          padding: 10px 12px; border-radius: 12px;
          background: linear-gradient(135deg,#15803D,#22C55E); color: #fff;
          border: none; font-family: inherit; font-size: 13px; font-weight: 700;
          cursor: pointer; flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(21,128,61,0.25);
        }
        .aic-newchat-btn:hover { filter: brightness(1.05); }
        .aic-sidebar-list { display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
        .aic-sidebar-empty {
          font-size: 12px; color: #9CA3AF; line-height: 1.6;
          padding: 12px 8px; text-align: center;
        }
        .aic-session-row {
          display: flex; align-items: center; justify-content: space-between; gap: 6px;
          padding: 9px 10px; border-radius: 10px; cursor: pointer;
          transition: background 0.15s ease;
        }
        .aic-session-row:hover { background: #F0FDF4; }
        .aic-session-row--active { background: #DCFCE7; }
        .aic-session-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
        .aic-session-title {
          font-size: 12.5px; font-weight: 600; color: #14532D;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .aic-session-time { font-size: 10.5px; color: #9CA3AF; }
        .aic-session-delete {
          flex-shrink: 0; background: none; border: none; cursor: pointer;
          font-size: 12px; opacity: 0; padding: 4px; border-radius: 6px;
          transition: opacity 0.15s ease, background 0.15s ease;
        }
        .aic-session-row:hover .aic-session-delete { opacity: 0.7; }
        .aic-session-delete:hover { opacity: 1 !important; background: #FEE2E2; }

        .aic-sidebar-toggle {
          display: none; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          background: #FFFFFF; border: 1px solid #E5E7EB; font-size: 14px; cursor: pointer;
        }
        .aic-sidebar-backdrop { display: none; }

        @media (max-width: 760px) {
          .aic-sidebar {
            position: fixed; inset: 0 auto 0 0; z-index: 30;
            transform: translateX(-100%);
            transition: transform 0.22s ease;
            box-shadow: 4px 0 24px rgba(0,0,0,0.15);
          }
          .aic-sidebar--open { transform: translateX(0); }
          .aic-sidebar-toggle { display: flex; }
          .aic-sidebar-backdrop {
            display: block; position: fixed; inset: 0; z-index: 20;
            background: rgba(0,0,0,0.35);
          }
        }

        .aic-wrap {
          display: flex; flex-direction: column; height: 100%;
          max-width: 1300px; width: 100%; margin: 0 auto;
          min-width: 0;
        }

        /* Feature pills */
        .aic-pills {
          display: flex; flex-wrap: wrap; gap: 8px;
          padding: 16px 40px 4px;
          flex-shrink: 0;
        }
        .aic-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 999px;
          background: #FFFFFF; border: 1px solid #E5E7EB;
          font-size: 12.5px; font-weight: 600; color: #374151;
          font-family: inherit; cursor: pointer; 
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .aic-pill:hover {
          transform: translateY(-2px);
          border-color: #BBF7D0;
          box-shadow: 0 6px 16px rgba(21,128,61,0.12);
          color: #15803D;
        }

        /* Scroll area */
        .aic-scroll {
          flex: 1; overflow-y: auto;
          padding: 12px 40px 8px;
          scrollbar-width: thin;
          scrollbar-color: #D1FAE5 transparent;
        }

        /* Hero welcome card */
        .aic-hero {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          padding: 28px 32px;
          margin: 8px 0 24px;
          box-shadow: 0 4px 20px rgba(17,24,39,0.05);
          animation: aic-fade-in 0.35s ease;
        }
        .aic-hero-title {
          margin: 0 0 6px; font-size: 22px; font-weight: 800; color: #111827;
          letter-spacing: -0.01em;
        }
        .aic-hero-sub { margin: 0 0 16px; font-size: 14px; color: #6B7280; }
        .aic-hero-topics { display: flex; flex-wrap: wrap; gap: 10px; }
        .aic-hero-topic {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 14px; border-radius: 12px;
          background: #F4FBF6; border: 1px solid #DCFCE7;
          font-size: 13px; font-weight: 600; color: #166534;
          font-family: inherit; cursor: pointer;
        }

        /* Messages */
        .aic-messages { display: flex; flex-direction: column; gap: 2px; }

        /* Typing indicator */
        .aic-typing {
          display: flex; align-items: center; gap: 6px;
          background: #FFFFFF; border: 1px solid #E5E7EB;
          border-radius: 18px; border-bottom-left-radius: 4px;
          padding: 14px 20px; box-shadow: 0 2px 10px rgba(17,24,39,0.05);
          margin-bottom: 14px;
        }
        .aic-typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: #22C55E; display: inline-block;
          animation: aic-bounce 1.2s infinite;
        }

        /* Suggestions */
        .aic-suggestions { margin: 12px 0 20px; }
        .aic-suggestions-label {
          margin: 0 0 12px; font-size: 12.5px; font-weight: 700;
          color: #6B7280; display: flex; align-items: center; gap: 6px;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .aic-suggestions-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .aic-suggestion-card {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 16px; border-radius: 16px;
          background: #FFFFFF; border: 1px solid #E5E7EB;
          text-align: left; cursor: pointer; font-family: inherit;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .aic-suggestion-card:hover {
          transform: translateY(-3px);
          border-color: #BBF7D0;
          box-shadow: 0 10px 24px rgba(21,128,61,0.12);
        }
        .aic-suggestion-icon {
          font-size: 20px; flex-shrink: 0;
          width: 38px; height: 38px; border-radius: 10px;
          background: #F4FBF6; display: flex; align-items: center; justify-content: center;
        }
        .aic-suggestion-text { display: block; font-size: 14px; font-weight: 700; color: #111827; }
        .aic-suggestion-desc { display: block; font-size: 12.5px; color: #6B7280; margin-top: 2px; line-height: 1.4; }

        /* Message bubbles (shared) */
        .msg-row { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 16px; animation: aic-fade-in 0.25s ease; }
        .msg-row--user { justify-content: flex-end; }
        .msg-col { display: flex; flex-direction: column; max-width: 68%; }
        .msg-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 800; color: #fff;
        }
        .msg-avatar--bot { background: linear-gradient(135deg,#166534,#22C55E); box-shadow: 0 3px 10px rgba(34,197,94,0.35); }
        .msg-avatar--user { background: linear-gradient(135deg,#0EA5E9,#15803D); box-shadow: 0 3px 10px rgba(14,165,233,0.3); }
        .msg-bubble {
          font-size: 14.5px; line-height: 1.7; padding: 13px 18px; border-radius: 18px;
        }
        .msg-bubble--bot {
          background: #FFFFFF; color: #111827;
          border: 1px solid #E5E7EB; border-bottom-left-radius: 4px;
          box-shadow: 0 2px 10px rgba(17,24,39,0.05);
        }
        .msg-bubble--error { background: #FEF2F2; border-color: #FECACA; color: #B91C1C; }
        .msg-bubble--user {
          background: linear-gradient(135deg,#15803D,#22C55E); color: #fff;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 16px rgba(21,128,61,0.28);
        }
        .msg-footer { display: flex; align-items: center; gap: 10px; margin-top: 4px; padding: 0 4px; }
        .msg-time { margin: 0; font-size: 10.5px; color: #9CA3AF; }
        .msg-actions { display: flex; align-items: center; gap: 2px; }
        .msg-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; border-radius: 7px;
          background: transparent; border: none; color: #9CA3AF; cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .msg-icon-btn:hover { background: #F3F4F6; color: #374151; }

        /* Input bar */
        .aic-input-bar {
          flex-shrink: 0; padding: 12px 40px 24px;
        }
        .aic-input-shell {
          display: flex; align-items: flex-end; gap: 8px;
          background: linear-gradient(120deg, #F0FDF4 0%, #FEFCE8 55%, #FEF9C3 100%);
          border: 1.5px solid #FDE68A;
          border-radius: 22px; padding: 8px 10px;
          box-shadow: 0 8px 26px rgba(202,138,4,0.14), 0 2px 8px rgba(21,128,61,0.08);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .aic-input-shell:focus-within {
          border-color: #4D7C0F;
          box-shadow: 0 0 0 3px rgba(77,124,15,0.16), 0 8px 26px rgba(202,138,4,0.16);
        }
        .aic-input-icon {
          width: 36px; height: 36px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.6); border: 1px solid #FDE68A; color: #A16207;
          cursor: not-allowed; opacity: 0.6;
        }
        .aic-textarea {
          flex: 1; resize: none; border: none; outline: none;
          font-family: inherit; font-size: 14.5px; line-height: 1.5;
          color: #14532D; background: transparent;
          padding: 9px 4px; max-height: 140px; overflow-y: auto;
        }
        .aic-textarea::placeholder { color: #A16207; opacity: 0.65; }
        .aic-send-btn {
          width: 40px; height: 40px; border-radius: 14px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; color: #fff;
          background: linear-gradient(135deg,#15803D,#4D7C0F,#CA8A04);
          box-shadow: 0 4px 14px rgba(202,138,4,0.4);
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .aic-send-btn:disabled {
          background: #E5E7EB; color: #9CA3AF; box-shadow: none; cursor: not-allowed;
        }
        .aic-send-btn:not(:disabled):hover { transform: scale(1.06); box-shadow: 0 6px 18px rgba(202,138,4,0.5); }
        .aic-send-btn:not(:disabled):active { transform: scale(0.94); }

        @keyframes aic-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes aic-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 760px) {
          .aic-pills { padding: 12px 16px 4px; }
          .aic-scroll { padding: 8px 16px 4px; }
          .aic-input-bar { padding: 10px 16px 18px; }
          .aic-suggestions-grid { grid-template-columns: 1fr; }
          .msg-col { max-width: 82%; }
          .aic-hero { padding: 20px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .msg-row, .aic-hero { animation: none; }
          .aic-typing span { animation: none; }
        }
      `}</style>
    </div>
    </div>
  );
}