import { useState, useRef } from 'react';
import { useCreatorStore } from '../../store/creatorStore';
import { Loader2, RefreshCw, X, Plus } from 'lucide-react';
import type { Character } from '../../types';

export default function Step2Characters() {
  const { activeLakeId, creationProfile, updateProfile, saveProfile } = useCreatorStore();
  const [input, setInput] = useState('');
  const [aiText, setAiText] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const characters = creationProfile.characters || [];

  const handleRegenerate = async () => {
    if (!input.trim() || !activeLakeId || isRegenerating) return;
    setIsRegenerating(true);
    setAiText('');
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`/api/interactive-drama/lakes/${activeLakeId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim(), step: 2 }),
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
              if (Array.isArray(d.characters)) {
                const existing = characters;
                const merged: Character[] = [...existing];
                for (const ch of d.characters as Character[]) {
                  if (!merged.find((m) => m.name === ch.name)) merged.push(ch);
                }
                updateProfile({ characters: merged });
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

  const removeChar = (idx: number) => {
    updateProfile({ characters: characters.filter((_, i) => i !== idx) });
    saveProfile();
  };

  const updateChar = (idx: number, field: keyof Character, value: string) => {
    const updated = characters.map((c, i) => (i === idx ? { ...c, [field]: value } : c));
    updateProfile({ characters: updated });
    saveProfile();
  };

  const addManual = () => {
    updateProfile({ characters: [...characters, { name: '', identity: '', personality: '', motivation: '', relationship: '' }] });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-1">Step 2: 审核角色</h2>
      <p className="text-sm text-white/40 mb-4">AI 已生成以下角色。你可以直接修改、删除，或输入修改意见让 AI 重新生成。</p>

      {/* Character cards */}
      {characters.length > 0 ? (
        <div className="space-y-3 mb-6">
          {characters.map((char, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white/80 font-medium">{char.name || `角色 ${idx + 1}`}</span>
                <button onClick={() => removeChar(idx)} className="text-white/25 hover:text-red-400"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[hsl(262,83%,63%)]" placeholder="名字" value={char.name} onChange={(e) => updateChar(idx, 'name', e.target.value)} />
                <input className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[hsl(262,83%,63%)]" placeholder="身份" value={char.identity} onChange={(e) => updateChar(idx, 'identity', e.target.value)} />
                <input className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[hsl(262,83%,63%)]" placeholder="性格" value={char.personality} onChange={(e) => updateChar(idx, 'personality', e.target.value)} />
                <input className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[hsl(262,83%,63%)]" placeholder="动机" value={char.motivation} onChange={(e) => updateChar(idx, 'motivation', e.target.value)} />
              </div>
              <input className="mt-3 w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[hsl(262,83%,63%)]" placeholder="与主角关系" value={char.relationship} onChange={(e) => updateChar(idx, 'relationship', e.target.value)} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm mb-6">AI 尚未生成角色，请先在 Step 1 生成完整设定。</p>
      )}

      <button onClick={addManual} className="flex items-center gap-1 text-xs text-[hsl(262,83%,63%)] hover:underline mb-4">
        <Plus size={12} /> 手动添加角色
      </button>

      {/* AI feedback */}
      {aiText && (
        <div className="mb-4 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <p className="text-white/80 text-sm whitespace-pre-wrap">{aiText}</p>
        </div>
      )}

      {/* Regenerate bar */}
      <div className="flex gap-2">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRegenerate(); } }}
          placeholder="修改意见，如「再加一个反派角色，是主角的前世仇人」"
          className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[hsl(262,83%,63%)]"
          disabled={isRegenerating}
        />
        <button onClick={handleRegenerate} disabled={isRegenerating || !input.trim()}
          className="px-4 py-2.5 bg-[hsl(262,83%,63%)]/15 hover:bg-[hsl(262,83%,63%)]/25 text-[hsl(262,83%,63%)] rounded-lg transition-colors disabled:opacity-40 flex items-center gap-2 text-sm"
        >
          {isRegenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          AI 重新生成
        </button>
      </div>
    </div>
  );
}
