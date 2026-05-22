import { useEffect, useCallback } from 'react';
import { ChevronLeft, Play, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCreatorStore } from '../../store/creatorStore';
import { CREATOR_STEPS } from '../../types';
import type { CreatorStep } from '../../types';
import Step1CoreIdea from './Step1CoreIdea';
import Step2Characters from './Step2Characters';
import Step3WorldStyle from './Step3WorldStyle';
import Step4EndingsEvents from './Step4EndingsEvents';
import Step5OutlinePreview from './Step5OutlinePreview';
import Step6GenerateContent from './Step6GenerateContent';

interface CreatorLayoutProps {
  lakeId: string | null;
  onBack: () => void;
  onPlay: (lakeId: string) => void;
}

export default function CreatorLayout({ lakeId, onBack, onPlay }: CreatorLayoutProps) {
  const { currentStep, creationProfile, lakeTitle, setCurrentStep, loadLake, saveProfile } =
    useCreatorStore();

  useEffect(() => {
    if (lakeId) {
      loadLake(lakeId);
    }
  }, [lakeId, loadLake]);

  const handleStepClick = (step: number) => {
    setCurrentStep(step as CreatorStep);
  };

  const goNext = useCallback(() => {
    saveProfile();
    if (currentStep < 6) setCurrentStep((currentStep + 1) as CreatorStep);
  }, [currentStep, setCurrentStep, saveProfile]);

  const goPrev = useCallback(() => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as CreatorStep);
  }, [currentStep, setCurrentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1CoreIdea />;
      case 2: return <Step2Characters />;
      case 3: return <Step3WorldStyle />;
      case 4: return <Step4EndingsEvents />;
      case 5: return <Step5OutlinePreview />;
      case 6: return <Step6GenerateContent />;
      default: return <Step1CoreIdea />;
    }
  };

  return (
    <div className="h-full flex">
      {/* Left: Step sidebar */}
      <div className="w-[180px] shrink-0 border-r border-white/10 flex flex-col bg-white/[0.02]">
        <div className="p-4 border-b border-white/10">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors"
          >
            <ChevronLeft size={16} />
            返回列表
          </button>
          <h3 className="text-white font-medium mt-3 truncate text-sm">{lakeTitle || '新故事湖'}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {CREATOR_STEPS.map((s) => {
            const isActive = s.step === currentStep;
            const isCompleted = s.step < currentStep;

            return (
              <button
                key={s.step}
                onClick={() => handleStepClick(s.step)}
                className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                  isActive
                    ? 'bg-[hsl(262,83%,63%)]/15 text-[hsl(262,83%,63%)] font-medium'
                    : isCompleted
                      ? 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                <span className="text-xs mr-2">{isCompleted ? '✓' : s.step}</span>
                {s.label}
              </button>
            );
          })}
        </div>
        {lakeId && (
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => onPlay(lakeId)}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-[hsl(160,84%,39%)]/15 hover:bg-[hsl(160,84%,39%)]/25 text-[hsl(160,84%,39%)] rounded-lg text-sm transition-colors"
            >
              <Play size={14} />
              播放验证
            </button>
          </div>
        )}
      </div>

      {/* Right: Step content + Navigation */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-6">{renderStep()}</div>
        </div>

        {/* Navigation footer */}
        <div className="shrink-0 border-t border-white/10 bg-white/[0.02] px-6 py-3 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentStep <= 1}
            className="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-white disabled:text-white/20 disabled:cursor-not-allowed text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            上一步
          </button>

          <span className="text-white/30 text-xs">
            {currentStep} / 6 · {CREATOR_STEPS[currentStep - 1]?.label}
          </span>

          <button
            onClick={goNext}
            disabled={currentStep >= 6}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(262,83%,63%)] hover:bg-[hsl(262,83%,58%)] text-white rounded-lg text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            下一步
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
