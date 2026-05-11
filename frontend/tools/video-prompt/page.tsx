import { useState } from 'react';
import { RotateCcw, Clock } from 'lucide-react';
import { usePromptStore } from './store/promptStore';
import InputPanel from './components/InputPanel';
import StoryboardView from './components/StoryboardView';
import HistoryPanel from './components/HistoryPanel';

export default function VideoPromptPage() {
  const chatPhase = usePromptStore((s) => s.chatPhase);
  const isStreaming = usePromptStore((s) => s.isStreaming);
  const sessions = usePromptStore((s) => s.sessions);
  const reset = usePromptStore((s) => s.reset);

  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-cm-surface">
      {/* Left: Input / History Panel */}
      <div className="w-[360px] shrink-0 border-r border-white/10 flex flex-col relative">
        {/* Panel header controls */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
          {/* History toggle */}
          <button
            onClick={() => setShowHistory((v) => !v)}
            className={`p-1.5 rounded-lg transition-colors relative ${
              showHistory
                ? 'text-cm-primary bg-cm-primary/10'
                : 'text-white/30 hover:text-white/60 hover:bg-white/5'
            }`}
            title="历史记录"
          >
            <Clock className="w-3.5 h-3.5" />
            {sessions.length > 0 && !showHistory && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cm-primary" />
            )}
          </button>

          {/* New / reset */}
          {chatPhase !== 'input' && (
            <button
              onClick={() => { reset(); setShowHistory(false); }}
              disabled={isStreaming}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors disabled:opacity-30"
              title="新建"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {showHistory ? (
          <HistoryPanel onClose={() => setShowHistory(false)} />
        ) : (
          <InputPanel />
        )}
      </div>

      {/* Right: Storyboard View */}
      <div className="flex-1 flex flex-col min-h-0">
        <StoryboardView />
      </div>
    </div>
  );
}
