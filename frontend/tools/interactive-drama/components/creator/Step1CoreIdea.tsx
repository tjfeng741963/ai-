import { useState } from 'react';
import { useCreatorStore } from '../../store/creatorStore';
import { Wand2, Loader2 } from 'lucide-react';

function parseSSEValue(raw: string): string {
  try {
    return JSON.parse(raw.slice(6)).content || '';
  } catch { return ''; }
}

export default function Step1CoreIdea() {
  const { activeLakeId, creationProfile, updateProfile, setCurrentStep, saveProfile } = useCreatorStore();
  const [idea, setIdea] = useState(creationProfile.coreIdea || '');
  const [aiText, setAiText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(!!creationProfile.coreIdea && creationProfile.characters.length > 0);

  const handleGenerate = async () => {
    if (!idea.trim() || !activeLakeId || isGenerating) return;
    setIsGenerating(true);
    setAiText('');
    setHasGenerated(false);

    try {
      const res = await fetch(`/api/interactive-drama/lakes/${activeLakeId}/generate-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      if (!res.ok) throw new Error('请求失败');

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6);
          if (raw === '[DONE]') continue;

          try {
            const event = JSON.parse(raw);
            if (event.type === 'delta' && event.content) {
              setAiText((prev) => prev + event.content);
            } else if (event.type === 'profile' && event.data) {
              // AI 一键生成完毕 → 填入完整 profile
              const d = event.data as Record<string, unknown>;
              const partial: Record<string, unknown> = {};

              if (typeof d.coreIdea === 'string') partial.coreIdea = d.coreIdea;
              if (typeof d.targetAudience === 'string') partial.targetAudience = d.targetAudience;
              if (typeof d.emotionalArc === 'string') partial.emotionalArc = d.emotionalArc;
              if (typeof d.worldSetting === 'string') partial.worldSetting = d.worldSetting;
              if (Array.isArray(d.characters)) partial.characters = d.characters;
              if (Array.isArray(d.endings)) partial.endings = d.endings;
              if (Array.isArray(d.keyEvents)) partial.keyEvents = d.keyEvents;
              if (d.styleParams && typeof d.styleParams === 'object') partial.styleParams = { ...d.styleParams as Record<string, unknown> };

              updateProfile(partial as Parameters<typeof updateProfile>[0]);
              setHasGenerated(true);

              // 保存到后端
              setTimeout(() => saveProfile(), 100);
            }
          } catch { /* */ }
        }
      }
    } catch (e) {
      setAiText((prev) => prev + '\n\n[生成失败，请重试]');
    } finally {
      setIsGenerating(false);
    }
  };

  const chars = creationProfile.characters || [];
  const endings = creationProfile.endings || [];
  const events = creationProfile.keyEvents || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Step 1: 说出你的想法</h2>
        <p className="text-sm text-white/40">你只需要描述故事想法，AI 会一口气生成角色、世界观、结局、转折等全部设定。</p>
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="例如：我想写一个修仙重生故事，女主回到三年前要改变家族覆灭的命运，前世仇人是今生的师父，风格先虐后燃..."
          rows={3}
          className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm resize-none focus:outline-none focus:border-[hsl(262,83%,63%)]"
          disabled={isGenerating}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !idea.trim()}
          className="shrink-0 px-6 py-3 bg-[hsl(262,83%,63%)] hover:bg-[hsl(262,83%,58%)] text-white rounded-xl font-medium transition-colors disabled:opacity-40 flex items-center gap-2 text-sm"
        >
          {isGenerating ? (
            <><Loader2 size={16} className="animate-spin" />生成中...</>
          ) : (
            <><Wand2 size={16} />一键生成全部设定</>
          )}
        </button>
      </div>

      {/* AI thinking */}
      {aiText && (
        <div className="p-5 rounded-xl border border-white/10 bg-white/[0.02] max-h-[400px] overflow-y-auto">
          <h4 className="text-xs font-medium text-[hsl(262,83%,63%)] mb-3">AI 正在构思...</h4>
          <div className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{aiText}</div>
        </div>
      )}

      {/* Generated summary */}
      {hasGenerated && !isGenerating && (
        <div className="p-5 rounded-xl border border-[hsl(160,84%,39%)]/20 bg-[hsl(160,84%,39%)]/5">
          <h4 className="text-sm font-medium text-[hsl(160,84%,39%)] mb-3">AI 已生成完整设定，请在后续步骤中审核</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <span className="text-white/50 text-xs">核心创意</span>
              <p className="text-white/80 mt-1 line-clamp-2">{creationProfile.coreIdea}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <span className="text-white/50 text-xs">角色</span>
              <p className="text-white/80 mt-1">{chars.length} 个角色：{chars.map(c => c.name).filter(Boolean).join('、') || '待定'}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <span className="text-white/50 text-xs">世界观</span>
              <p className="text-white/80 mt-1 line-clamp-2">{creationProfile.worldSetting || '待定'}</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03]">
              <span className="text-white/50 text-xs">结局</span>
              <p className="text-white/80 mt-1">{endings.length} 个结局</p>
            </div>
          </div>
          <button
            onClick={() => setCurrentStep(2)}
            className="mt-4 px-4 py-2 bg-[hsl(160,84%,39%)] hover:bg-[hsl(160,84%,36%)] text-white rounded-lg text-sm transition-colors"
          >
            查看并审核角色 →
          </button>
        </div>
      )}
    </div>
  );
}
