import { useRef, useCallback } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { usePromptStore } from '../store/promptStore';
import { TIERS } from '../types';
import type { TierType, OptionCard } from '../types';

const QUICK_TEMPLATES = [
  { label: '产品展示', template: '给我的【产品名】做一个展示视频，重点展示它的' },
  { label: '人物种草', template: '拍一个真人种草视频，推荐我的【产品名】，让观众感受到' },
  { label: '场景剧情', template: '拍一个小剧情视频，围绕我的【产品名】，故事是' },
];

export default function InputPanel() {
  const input = usePromptStore((s) => s.input);
  const chatPhase = usePromptStore((s) => s.chatPhase);
  const chatMessages = usePromptStore((s) => s.chatMessages);
  const options = usePromptStore((s) => s.options);
  const selectedStyle = usePromptStore((s) => s.selectedStyle);
  const selectedTier = usePromptStore((s) => s.selectedTier);
  const isStreaming = usePromptStore((s) => s.isStreaming);
  const error = usePromptStore((s) => s.error);
  const setInput = usePromptStore((s) => s.setInput);
  const sendMessage = usePromptStore((s) => s.sendMessage);
  const selectOption = usePromptStore((s) => s.selectOption);
  const setSelectedTier = usePromptStore((s) => s.setSelectedTier);
  const generate = usePromptStore((s) => s.generate);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed);
    setInput('');
  }, [input, isStreaming, sendMessage, setInput]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleQuickTemplate = useCallback(
    (template: string) => {
      setInput(template);
      textareaRef.current?.focus();
    },
    [setInput]
  );

  const handleOptionClick = useCallback(
    (option: OptionCard) => {
      if (isStreaming) return;
      selectOption(option);
    },
    [isStreaming, selectOption]
  );

  const handleGenerate = useCallback(() => {
    if (!selectedStyle || !selectedTier || isStreaming) return;
    generate();
  }, [selectedStyle, selectedTier, isStreaming, generate]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/10 shrink-0">
        <h2 className="text-sm font-semibold text-white">视频分镜脚本</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {/* 初始输入区 */}
        {chatPhase === 'input' && (
          <>
            <p className="text-white/50 text-xs leading-relaxed">
              告诉我你想做什么视频？AI 会帮你自动规划分镜脚本。
            </p>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="比如：给我的保温杯做一个视频，展示它的保温性、密封性和便携性"
              className="w-full h-28 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-cm-primary/50"
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => handleQuickTemplate(t.template)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:text-white hover:bg-white/10 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cm-primary text-cm-surface text-sm font-medium hover:bg-cm-primary/80 transition-colors disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
              开始规划
            </button>
          </>
        )}

        {/* 对话消息 */}
        {chatPhase !== 'input' && (
          <div className="space-y-3">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`text-xs leading-relaxed ${msg.role === 'user' ? 'text-white/70' : 'text-white/90'}`}>
                <span className="text-white/40 text-[10px] font-medium uppercase">
                  {msg.role === 'user' ? '你' : 'AI'}
                </span>
                <p className="mt-1 whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}

            {isStreaming && chatPhase === 'confirming' && (
              <div className="flex items-center gap-1.5 text-cm-primary text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                分析中...
              </div>
            )}
          </div>
        )}

        {/* 风格选项卡片 */}
        {chatPhase === 'confirming' && !isStreaming && options.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/40 text-[10px] font-medium">选择拍摄风格</p>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
                  opt.selected
                    ? 'border-cm-primary bg-cm-primary/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="text-xs font-medium">{opt.label}</div>
                <div className="text-[10px] text-white/40 mt-0.5">{opt.description}</div>
              </button>
            ))}
          </div>
        )}

        {/* 档位选择 */}
        {chatPhase === 'tier_select' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-cm-primary font-medium">✓ 风格：{selectedStyle}</span>
            </div>
            <p className="text-white/40 text-[10px] font-medium">选择视频时长</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(TIERS) as [TierType, typeof TIERS['15s']][]).map(([key, tier]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  className={`px-2 py-3 rounded-xl border text-center transition-colors ${
                    selectedTier === key
                      ? 'border-cm-primary bg-cm-primary/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="text-sm font-semibold">{tier.duration}</div>
                  <div className="text-[10px] text-white/40 mt-1">{tier.shots}镜</div>
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!selectedTier || isStreaming}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cm-primary text-cm-surface text-sm font-medium hover:bg-cm-primary/80 transition-colors disabled:opacity-30"
            >
              <Sparkles className="w-4 h-4" />
              生成分镜脚本 →
            </button>
          </div>
        )}

        {/* 生成中 */}
        {chatPhase === 'generating' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-cm-primary font-medium">✓ 风格：{selectedStyle}</span>
              <span className="text-xs text-cm-primary font-medium">✓ 时长：{selectedTier && TIERS[selectedTier]?.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-cm-primary text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              正在生成分镜脚本...
            </div>
          </div>
        )}

        {/* 完成 */}
        {chatPhase === 'done' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-400 font-medium">✓ 分镜脚本已生成</span>
            </div>
            <p className="text-white/40 text-xs">
              在右侧查看分镜表格，上传参考图后可复制完整脚本。
            </p>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs shrink-0">
          {error}
        </div>
      )}
    </div>
  );
}
