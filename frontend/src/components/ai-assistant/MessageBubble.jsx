// src/components/ai/MessageBubble.jsx


const formatText = (text) => {
  // Convert **bold** to <strong> and \n to <br>
  return text
    .split('\n')
    .map((line, lineIdx) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={lineIdx}>
          {parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
              : <span key={i}>{part}</span>
          )}
          {lineIdx < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
};

export default function MessageBubble({ message }) {
  const isUser      = message.role === 'user';
  const isError     = message.isError ?? false;

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';

  if (isUser) {
    return (
      <div className="flex justify-end items-end gap-2">
        <div className="max-w-[78%]">
          <div className="bg-green-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm">
            {formatText(message.text)}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 text-right pr-1">{time}</p>
        </div>

        {/* User avatar */}
        <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          U
        </div>
      </div>
    );
  }

  // Assistant bubble
  return (
    <div className="flex items-end gap-2">
      {/* Bot avatar */}
      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-sm flex-shrink-0">
        🌿
      </div>

      <div className="max-w-[78%]">
        <div
          className={`rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isError
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-white border border-gray-100 text-gray-800'
          }`}
        >
          {formatText(message.text)}
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 pl-1">{time}</p>
      </div>
    </div>
  );
}
