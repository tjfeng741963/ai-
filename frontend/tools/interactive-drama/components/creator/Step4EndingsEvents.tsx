import { useState, useRef } from 'react';
import { useCreatorStore } from '../../store/creatorStore';
import type { Ending, KeyEvent } from '../../types';
import { Loader2, RefreshCw, X, Plus } from 'lucide-react';
import { ENDING_TYPE_LABELS } from '../../types';

export default function Step4EndingsEvents() {
  const { activeLakeId, creationProfile, updateProfile, saveProfile } = useCreatorStore();
  const [input, setInput] = useState('');
  const [aiText, setAiText] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const endings = creationProfile.endings || [];
  const keyEvents = creationProfile.keyEvents || [];

  const handleRegenerate = async () => {
    if (!input.trim() || !activeLakeId || isRegenerating) return;
    setIsRegenerating(true);
    setAiText('');
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`/api/interactive-drama/lakes/${activeLakeId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim(), step: 4 }),
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
              if (Array.isArray(d.endings)) {
                const existing = endings;
                const merged: Ending[] = [...existing];
                for (const e of d.endings as Ending[]) {
                  if (!merged.find((m) => m.name === e.name)) merged.push(e);
                }
                updateProfile({ endings: merged });
              }
              if (Array.isArray(d.keyEvents)) {
                const existing = keyEvents;
                const merged: KeyEvent[] = [...existing];
                for (const ke of d.keyEvents as KeyEvent[]) {
                  if (!merged.find((m) => m.description === ke.description)) merged.push(ke);
                }
                updateProfile({ keyEvents: merged });
              }
              setTimeout(() => saveProfile(), 100);
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

  const endingColors: Record<string, string> = {
    good: 'border-emerald-500/20 bg-emerald-500/5',
    bad: 'border-red-500/20 bg-red-500/5',
    hidden: 'border-purple-500/20 bg-purple-500/5',
    true: 'border-amber-500/20 bg-amber-500/5',
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Step 4: 审核结局与转折</h2>
      <p className="text-sm text-white/40 mb-4">AI 已生成结局和关键转折。你可以直接修改或让 AI 重新生成。</p>

      {/* Endings */}
      <div className="mb-5">
        <h4 className="text-sm font-medium text-white/70 mb-3">结局 ({endings.length})</h4>
        {endings.length === 0 && <p className="text-white/30 text-sm">暂无结局，请先在 Step 1 生成。</p>}
        {endings.map((ending, idx) => (
          <div key={idx} className={`mb-2 p-3 rounded-xl border ${endingColors[ending.type] || 'border-white/10'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-sm font-medium">{ending.name || `结局 ${idx + 1}`}</span>
              <button onClick={() => {
                const updated = endings.filter((_, i) => i !== idx);
                updateProfile({ endings: updated }); saveProfile();
              }} className="text-white/25 hover:text-red-400"><X size={12} /></button>
            </div>
            <div className="flex gap-2">
              <input className="flex-1 bg-white/[0.04] border border-white/10 rounded px-2 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none" placeholder="名称" value={ending.name}
                onChange={(e) => {
                  const updated = endings.map((en, i) => i === idx ? { ...en, name: e.target.value } : en);
                  updateProfile({ endings: updated }); saveProfile();
                }} />
              <select value={ending.type}
                onChange={(e) => {
                  const updated = endings.map((en, i) => i === idx ? { ...en, type: e.target.value as Ending['type'] } : en);
                  updateProfile({ endings: updated }); saveProfile();
                }}
                className="bg-white/[0.04] border border-white/10 rounded px-2 py-1.5 text-white text-xs">
                {Object.entries(ENDING_TYPE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
          </div>
        ))}
        <button onClick={() => { updateProfile({ endings: [...endings, { name: '', type: 'good', description: '' }] }); saveProfile(); }}
          className="flex items-center gap-1 text-xs text-[hsl(262,83%,63%)] hover:underline"><Plus size={12} /> 添加结局</button>
      </div>

      {/* Key Events */}
      <div className="mb-5">
        <h4 className="text-sm font-medium text-white/70 mb-3">关键转折 ({keyEvents.length})</h4>
        {keyEvents.length === 0 && <p className="text-white/30 text-sm">暂无转折事件。</p>}
        {keyEvents.map((event, idx) => (
          <div key={idx} className="mb-2 flex gap-2 items-center">
            <input className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none" placeholder="事件描述" value={event.description}
              onChange={(e) => {
                const updated = keyEvents.map((ev, i) => i === idx ? { ...ev, description: e.target.value } : ev);
                updateProfile({ keyEvents: updated }); saveProfile();
              }} />
            <input className="w-28 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/25 focus:outline-none" placeholder="时机" value={event.expectedTiming}
              onChange={(e) => {
                const updated = keyEvents.map((ev, i) => i === idx ? { ...ev, expectedTiming: e.target.value } : ev);
                updateProfile({ keyEvents: updated }); saveProfile();
              }} />
            <button onClick={() => { updateProfile({ keyEvents: keyEvents.filter((_, i) => i !== idx) }); saveProfile(); }}
              className="text-white/25 hover:text-red-400 shrink-0"><X size={12} /></button>
          </div>
        ))}
        <button onClick={() => { updateProfile({ keyEvents: [...keyEvents, { description: '', expectedTiming: '' }] }); saveProfile(); }}
          className="flex items-center gap-1 text-xs text-[hsl(262,83%,63%)] hover:underline"><Plus size={12} /> 添加事件</button>
      </div>

      {aiText && (
        <div className="mb-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <p className="text-white/80 text-sm whitespace-pre-wrap">{aiText}</p>
        </div>
      )}

      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRegenerate(); } }}
          placeholder="修改意见，如「加一个隐藏结局，主角发现一切都是梦境」"
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
