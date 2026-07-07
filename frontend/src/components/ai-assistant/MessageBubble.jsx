const formatText = (text) => {
  return text.split('\n').map((line, lineIdx, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIdx}>
        {parts.map((part, i) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>
            : <span key={i}>{part}</span>
        )}
        {lineIdx < arr.length - 1 && <br />}
      </span>
    );
  });
};

const IconBtn = ({ title, active, onClick, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className="msg-icon-btn"
    style={active ? { color: '#15803D', background: '#DCFCE7' } : undefined}
  >
    {children}
  </button>
);

export default function MessageBubble({
  message,
  isLatestAssistant = false,
  onCopy,
  onRegenerate,
  onFeedback,
}) {
  const isUser = message.role === 'user';
  const isError = message.isError ?? false;

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  if (isUser) {
    return (
      <div className="msg-row msg-row--user">
        <div className="msg-col" style={{ alignItems: 'flex-end' }}>
          <div className="msg-bubble msg-bubble--user">
            {formatText(message.text)}
          </div>
          <p className="msg-time" style={{ textAlign: 'right' }}>{time}</p>
        </div>
        <div className="msg-avatar msg-avatar--user">U</div>
      </div>
    );
  }

  // Assistant bubble
  return (
    <div className="msg-row">
      <div className="msg-avatar msg-avatar--bot" aria-hidden="true">🌱</div>

      <div className="msg-col">
        <div className={`msg-bubble msg-bubble--bot${isError ? ' msg-bubble--error' : ''}`}>
          {formatText(message.text)}
        </div>

        <div className="msg-footer">
          <p className="msg-time">{time}</p>

          {!isError && (
            <div className="msg-actions">
              <IconBtn title="Copy response" onClick={() => onCopy?.(message.text)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M4 16V5a1 1 0 011-1h11" />
                </svg>
              </IconBtn>

              {isLatestAssistant && (
                <IconBtn title="Regenerate response" onClick={() => onRegenerate?.()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 4v5h5" />
                    <path d="M20 20v-5h-5" />
                    <path d="M5 9a8 8 0 0113.6-3.4L20 9M19 15a8 8 0 01-13.6 3.4L4 15" />
                  </svg>
                </IconBtn>
              )}

              <IconBtn
                title="Good response"
                active={message.feedback === 'up'}
                onClick={() => onFeedback?.(message.feedback === 'up' ? null : 'up')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M7 10v11H4a1 1 0 01-1-1v-9a1 1 0 011-1h3zm0 0l4.4-7.3a1.5 1.5 0 012.6 1.5L12.8 9H19a2 2 0 012 2.3l-1.4 7A2 2 0 0117.6 20H10a3 3 0 01-3-3" />
                </svg>
              </IconBtn>

              <IconBtn
                title="Poor response"
                active={message.feedback === 'down'}
                onClick={() => onFeedback?.(message.feedback === 'down' ? null : 'down')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ transform: 'scaleY(-1)' }}>
                  <path d="M7 10v11H4a1 1 0 01-1-1v-9a1 1 0 011-1h3zm0 0l4.4-7.3a1.5 1.5 0 012.6 1.5L12.8 9H19a2 2 0 012 2.3l-1.4 7A2 2 0 0117.6 20H10a3 3 0 01-3-3" />
                </svg>
              </IconBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}