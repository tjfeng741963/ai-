import { useState, useRef } from 'react';
import { useCreatorStore } from '../../store/creatorStore';
import { Loader2, RefreshCw } from 'lucide-react';

export default function Step3WorldStyle() {
  const { activeLakeId, creationProfile, updateProfile, saveProfile } = useCreatorStore();
  const [input, setInput] = useState('');
  const [aiText, setAiText] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const style = creationProfile.styleParams || {};

  const handleRegenerate = async () => {
    if (!input.trim() || !activeLakeId || isRegenerating) return;
    setIsRegenerating(true);
    setAiText('');
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`/api/interactive-drama/lakes/${activeLakeId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim(), step: 3 }),
        signal: abortRef.current.signal,
      });
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
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'delta' && event.content) setAiText((p) => p + event.content);
            else if (event.type === 'profile' && event.data) {
              const d = event.data as Record<string, unknown>;
              const partial: Record<string, unknown> = {};
              if (typeof d.worldSetting === 'string') partial.worldSetting = d.worldSetting;
              if (d.styleParams && typeof d.styleParams === 'object') partial.styleParams = { ...style, ...d.styleParams as Record<string, unknown> };
              if (Object.keys(partial).length > 0) {
                updateProfile(partial as Parameters<typeof updateProfile>[0]);
                setTimeout(() => saveProfile(), 100);
              }
            }
          } catch { /* */ }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') setAiText((p) => p + '\n[失败]');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Step 3: 审核世界观与风格</h2>
      <p className="text-sm text-white/40 mb-4">AI 已生成世界观设定和风格参数。你可以直接修改或让 AI 重新生成。</p>

      {/* World setting */}
      <div className="mb-5">
        <label className="block text-sm text-white/60 mb-2">世界观</label>
        <textarea
          value={creationProfile.worldSetting || ''}
          onChange={(e) => { updateProfile({ worldSetting: e.target.value }); saveProfile(); }}
          rows={4}
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 resize-none focus:outline-none focus:border-[hsl(262,83%,63%)]"
        />
      </div>

      {/* Style params */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-white/50">节奏密度</label>
          <select value={style.pacingDensity || 'standard'}
            onChange={(e) => { updateProfile({ styleParams: { ...style, pacingDensity: e.target.value } }); saveProfile(); }}
            className="w-full mt-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[hsl(262,83%,63%)]">
            <option value="ultra-dense">极密集</option>
            <option value="dense">高密度</option>
            <option value="standard">标准</option>
            <option value="relaxed">舒缓</option>
            <option value="ultra-relaxed">超舒缓</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-white/50">每节点选项数</label>
          <select value={`${style.branchDensity || 3}`}
            onChange={(e) => { updateProfile({ styleParams: { ...style, branchDensity: parseInt(e.target.value) } }); saveProfile(); }}
            className="w-full mt-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[hsl(262,83%,63%)]">
            <option value="2">2</option>
            <option value="3">2-3</option>
            <option value="4">2-4</option>
          </select>
        </div>
      </div>

      {aiText && (
        <div className="mb-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <p className="text-white/80 text-sm whitespace-pre-wrap">{aiText}</p>
        </div>
      )}

      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRegenerate(); } }}
          placeholder="修改意见，如「世界观改成灵气复苏的现代都市」"
          className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[hsl(262,83%,63%)]"
          disabled={isRegenerating} />
        <button onClick={handleRegenerate} disabled={isRegenerating || !input.trim()}
          className="px-4 py-2.5 bg-[hsl(262,83%,63%)]/15 hover:bg-[hsl(262,83%,63%)]/25 text-[hsl(262,83%,63%)] rounded-lg transition-colors disabled:opacity-40 flex items-center gap-2 text-sm">
          {isRegenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          AI 重新生成
        </button>
      </div>
    </div>
  );
}
