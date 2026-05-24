import { memo } from 'react';
import { Package, Users, Target, Lightbulb, Film, Check, Lock, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

const STEP_ICONS = [Package, Users, Target, Lightbulb, Film];

export default memo(function FlowProgress() {
  const getFlowSteps = useChatStore((s) => s.getFlowSteps);
  const viewingStep = useChatStore((s) => s.viewingStep);
  const setViewingStep = useChatStore((s) => s.setViewingStep);
  const currentStep = useChatStore((s) => s.currentStep);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const steps = getFlowSteps();

  const getStatusIcon = (status: string, isActive: boolean) => {
    if (status === 'completed') return <Check className="w-3 h-3 text-green-400" />;
    if (status === 'active' && isStreaming) return <Loader2 className="w-3 h-3 text-cm-primary animate-spin" />;
    if (status === 'active') return null;
    return <Lock className="w-3 h-3 text-white/20" />;
  };

  return (
    <aside className="w-[140px] shrink-0 h-full">
      <div className="flex flex-col gap-1 p-3 h-full overflow-y-auto">
        <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 px-2">
          创作流程
        </h5>

        {steps.map((step, i) => {
          const Icon = STEP_ICONS[i];
          const isViewing = viewingStep === step.step;
          const clickable = step.step <= currentStep;

          return (
            <button
              key={step.step}
              onClick={() => clickable && setViewingStep(step.step)}
              disabled={!clickable}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-xs ${
                isViewing
                  ? 'bg-cm-primary/10 text-cm-primary border border-cm-primary/20'
                  : clickable
                    ? 'text-white/50 hover:text-white hover:bg-white/5'
                    : 'text-white/20 cursor-not-allowed'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isViewing ? 'text-cm-primary' : ''}`} />
              <span className="flex-1 truncate">{step.label}</span>
              {getStatusIcon(step.status, isViewing)}
            </button>
          );
        })}

      </div>
    </aside>
  );
});
