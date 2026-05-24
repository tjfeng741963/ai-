import ChatPanel from './components/ChatPanel';
import FlowSteps from './components/FlowSteps';
import StoryboardPreview from './components/StoryboardPreview';
import SessionHistory from './components/SessionHistory';

export default function MVStoryboardPage() {
  return (
    <>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <div className="w-[280px] shrink-0 border-r border-white/10 flex flex-col min-h-0">
          <ChatPanel />
        </div>
        <div className="shrink-0 border-r border-white/10">
          <FlowSteps />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <StoryboardPreview />
        </div>
      </div>
      <SessionHistory />
    </>
  );
}
