// src/pages/AIAssistant.jsx
//   import AIAssistant from '../pages/AIAssistant';
//   <Route path="/ai-assistant" element={<PrivateRoute><AIAssistant /></PrivateRoute>} />

import ChatInterface from '../components/ai-assistant/ChatInterface';

export default function AIAssistant() {
  return (
    <div className="h-screen flex flex-col">

      {/* Page title bar (outside ChatInterface so it's always visible) */}
      <div className="bg-green-700 px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <span className="text-2xl">🤖</span>
        <div>
          <h1 className="text-white font-bold text-base leading-tight">AI AgriConnect Assistant</h1>
          <p className="text-green-200 text-xs">Powered by AgriConnect AI</p>
        </div>
      </div>

      {/* Chat fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface compact />
      </div>
    </div>
  );
}
