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

export default function MessageBubble({ message, darkMode = false }) {
  const isUser = message.role === 'user';
  const isError = message.isError ?? false;

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '10px', marginBottom: '14px' }}>
        <div style={{ maxWidth: '68%' }}>
          <div style={{
            background: 'linear-gradient(135deg,#166534,#16a34a)',
            color: '#fff',
            borderRadius: '18px', borderBottomRightRadius: '4px',
            padding: '13px 18px',
            fontSize: '14px', lineHeight: 1.7,
            boxShadow: '0 4px 20px rgba(22,163,74,0.4)',
            border: '1px solid rgba(74,222,128,0.3)',
          }}>
            {formatText(message.text)}
          </div>
          <p style={{ margin: '5px 4px 0 0', fontSize: '10px', color: 'rgba(134,239,172,0.5)', textAlign: 'right' }}>{time}</p>
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#14532d,#16a34a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '13px', fontWeight: 800,
          boxShadow: '0 0 16px rgba(22,163,74,0.45)',
          border: '2px solid rgba(74,222,128,0.4)',
        }}>U</div>
      </div>
    );
  }

  // Assistant bubble
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '14px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#14532d,#16a34a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '17px',
        boxShadow: '0 0 16px rgba(22,163,74,0.4)',
        border: '2px solid rgba(134,239,172,0.35)',
      }}>🤖</div>

      <div style={{ maxWidth: '68%' }}>
        <div style={{
          background: isError
            ? 'rgba(153,27,27,0.5)'
            : 'rgba(15,45,20,0.82)',
          border: isError
            ? '1.5px solid rgba(252,165,165,0.4)'
            : '1.5px solid rgba(134,239,172,0.2)',
          borderRadius: '18px', borderBottomLeftRadius: '4px',
          padding: '13px 18px',
          fontSize: '14px', lineHeight: 1.7,
          color: isError ? '#fca5a5' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}>
          {formatText(message.text)}
        </div>
        <p style={{ margin: '5px 0 0 4px', fontSize: '10px', color: 'rgba(134,239,172,0.4)' }}>{time}</p>
      </div>
    </div>
  );
}
