import ChatPanel from './components/ChatPanel';
import ScriptPreview from './components/ScriptPreview';
import TierModal from './components/TierModal';
import FlowProgress from './components/FlowProgress';
import SessionHistory from './components/SessionHistory';

export default function AdScriptPage() {
  return (
    <>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <div className="w-[280px] shrink-0 border-r border-white/10 flex flex-col min-h-0">
          <ChatPanel />
        </div>
        <div className="shrink-0 border-r border-white/10">
          <FlowProgress />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <ScriptPreview />
        </div>
      </div>
      <TierModal />
      <SessionHistory />
    </>
  );
}
