import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import axiosInstance from '../../utils/axiosInstance';

const WELCOME_MESSAGE = {
  role: 'assistant',
  text: 'Namaste 🙏 I am your AgriConnect AI assistant.\n\nYou can ask me about:\n• Crop selection & sowing dates\n• Fertilizer & pesticide advice\n• Mandi prices & selling tips\n• Government schemes eligibility\n\nHow can I help you today?',
  timestamp: new Date().toISOString(),
};

const suggestions = [
  { text: 'Which crops are best for June in UP?', icon: '🌾' },
  { text: 'What is the MSP for wheat this year?', icon: '📈' },
  { text: 'How to treat yellow rust in wheat?', icon: '🐛' },
  { text: 'Am I eligible for PM-KISAN?', icon: '🏛️' },
];

export default function ChatInterface({ compact = false, darkMode = false }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { role: 'user', text, timestamp: new Date().toISOString() }]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/v1/ai/chat', {
        message: text,
        history: messages.slice(-6).map(m => ({ role: m.role, content: m.text })),
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.data?.reply ?? 'Sorry, I could not get a response.',
        timestamp: new Date().toISOString(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: '⚠️ ' + (err.response?.data?.message ?? 'Network error. Please try again.'),
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'transparent',
    }}>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '28px 40px',
        display: 'flex', flexDirection: 'column', gap: '4px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(134,239,172,0.3) transparent',
      }}>
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} darkMode={darkMode} />
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#14532d,#16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', flexShrink: 0,
              boxShadow: '0 0 16px rgba(22,163,74,0.5)',
              border: '2px solid rgba(134,239,172,0.4)',
            }}>🤖</div>
            <div style={{
              background: 'rgba(15,45,20,0.85)',
              border: '1.5px solid rgba(134,239,172,0.25)',
              borderRadius: '18px', borderBottomLeftRadius: '4px',
              padding: '14px 20px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#4ade80',
                    animation: 'agri-bounce 1.2s infinite',
                    animationDelay: `${i * 0.2}s`,
                    boxShadow: '0 0 6px #4ade80',
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {messages.length === 1 && !loading && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'rgba(134,239,172,0.7)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              💡 Try asking:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {suggestions.map(({ text, icon }) => (
                <button key={text}
                  onClick={() => { setInput(text); inputRef.current?.focus(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '14px 16px', borderRadius: '14px',
                    background: 'rgba(15,45,20,0.7)',
                    border: '1.5px solid rgba(134,239,172,0.2)',
                    fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)',
                    cursor: 'pointer', outline: 'none', textAlign: 'left',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(22,163,74,0.25)';
                    e.currentTarget.style.borderColor = 'rgba(134,239,172,0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(15,45,20,0.7)';
                    e.currentTarget.style.borderColor = 'rgba(134,239,172,0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
                  }}
                >
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
                  <span style={{ lineHeight: 1.4 }}>{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '16px 40px 20px',
        background: 'rgba(5,20,8,0.85)',
        borderTop: '1px solid rgba(134,239,172,0.15)',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'flex-end', gap: '12px',
        flexShrink: 0,
        boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
      }}>
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about farming…"
          style={{
            flex: 1, resize: 'none',
            border: '1.5px solid rgba(134,239,172,0.3)',
            borderRadius: '16px',
            padding: '14px 20px',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit',
            color: '#fff',
            background: 'rgba(15,45,20,0.6)',
            maxHeight: '112px',
            overflowY: 'auto',
            transition: 'border 0.2s, box-shadow 0.2s',
            lineHeight: 1.5,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}
          onFocus={e => {
            e.target.style.border = '1.5px solid rgba(74,222,128,0.7)';
            e.target.style.boxShadow = '0 0 0 3px rgba(74,222,128,0.12), 0 2px 12px rgba(0,0,0,0.2)';
          }}
          onBlur={e => {
            e.target.style.border = '1.5px solid rgba(134,239,172,0.3)';
            e.target.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
            background: !loading && input.trim()
              ? 'linear-gradient(135deg,#16a34a,#22c55e)'
              : 'rgba(255,255,255,0.07)',
            color: !loading && input.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
            border: !loading && input.trim()
              ? '1.5px solid rgba(74,222,128,0.5)'
              : '1.5px solid rgba(255,255,255,0.1)',
            cursor: !loading && input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: !loading && input.trim() ? '0 4px 16px rgba(22,163,74,0.4)' : 'none',
          }}
          onMouseEnter={e => { if (!loading && input.trim()) { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,163,74,0.55)'; } }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = !loading && input.trim() ? '0 4px 16px rgba(22,163,74,0.4)' : 'none'; }}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{ transform: 'rotate(90deg)' }}>
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>

      <style>{`@keyframes agri-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }`}</style>
    </div>
  );
}
