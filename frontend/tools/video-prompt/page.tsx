import { RotateCcw } from 'lucide-react';
import { usePromptStore } from './store/promptStore';
import InputPanel from './components/InputPanel';
import StoryboardView from './components/StoryboardView';

export default function VideoPromptPage() {
  const chatPhase = usePromptStore((s) => s.chatPhase);
  const isStreaming = usePromptStore((s) => s.isStreaming);
  const reset = usePromptStore((s) => s.reset);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-cm-surface">
      {/* Left: Input Panel */}
      <div className="w-[360px] shrink-0 border-r border-white/10 flex flex-col">
        <InputPanel />
      </div>

      {/* Right: Storyboard View */}
      <div className="flex-1 flex flex-col min-h-0">
        <StoryboardView />
      </div>

      {/* Reset button - top right floating */}
      {chatPhase !== 'input' && (
        <button
          onClick={reset}
          disabled={isStreaming}
          className="absolute top-[76px] right-4 p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors disabled:opacity-30 z-10"
          title="新建"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
