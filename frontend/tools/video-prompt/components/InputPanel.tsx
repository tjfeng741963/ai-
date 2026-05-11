import { useRef, useCallback, useState } from 'react';
import { Send, Loader2, Sparkles, ImagePlus, Link, X } from 'lucide-react';
import { usePromptStore } from '../store/promptStore';
import { TIERS } from '../types';
import type { TierType, OptionCard } from '../types';

const MAX_IMAGES = 5;

const QUICK_TEMPLATES = [
  { label: '产品展示', template: '给我的保温杯做一个展示视频，重点展示保温效果和密封性' },
  { label: '人物种草', template: '拍一个真人种草视频，推荐我的防晒霜，主打轻薄不闷痘' },
  { label: '场景剧情', template: '拍一个小剧情，展示蓝牙耳机在通勤、健身、居家三个场景' },
];

function useImagePicker() {
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = useCallback(() => fileRef.current?.click(), []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    const toRead = files.slice(0, remaining);
    Promise.all(
      toRead.map(
        (f) =>
          new Promise<string>((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.readAsDataURL(f);
          })
      )
    ).then((b64s) => setImages((prev) => [...prev, ...b64s]));
    e.target.value = '';
  }, [images.length]);

  const remove = useCallback((i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const clear = useCallback(() => setImages([]), []);

  return { images, pick, onFileChange, remove, clear, fileRef };
}

function ImageThumbnails({
  images,
  onRemove,
}: {
  images: string[];
  onRemove: (i: number) => void;
}) {
  if (!images.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {images.map((src, i) => (
        <div key={i} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-white/15 shrink-0">
          <img src={src} alt="" className="w-full h-full object-cover" />
          <button
            onClick={() => onRemove(i)}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      ))}
    </div>
  );
}

function MediaInputRow({
  images,
  onPickImage,
  onFileChange,
  onRemoveImage,
  fileRef,
  productUrl,
  onUrlChange,
  showUrl,
  onToggleUrl,
  disabled,
}: {
  images: string[];
  onPickImage: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (i: number) => void;
  fileRef: React.RefObject<HTMLInputElement>;
  productUrl: string;
  onUrlChange: (v: string) => void;
  showUrl: boolean;
  onToggleUrl: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <button
          onClick={onPickImage}
          disabled={disabled || images.length >= MAX_IMAGES}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors text-[11px] disabled:opacity-30"
          title="上传产品图片（最多5张）"
        >
          <ImagePlus className="w-3.5 h-3.5" />
          {images.length > 0 ? `${images.length}/${MAX_IMAGES}` : '上传图片'}
        </button>
        <button
          onClick={onToggleUrl}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors disabled:opacity-30 ${
            showUrl
              ? 'bg-cm-primary/10 border-cm-primary/30 text-cm-primary'
              : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/8'
          }`}
          title="粘贴商品链接"
        >
          <Link className="w-3.5 h-3.5" />
          商品链接
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
      </div>

      {showUrl && (
        <input
          type="text"
          value={productUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="粘贴淘宝/天猫/抖音商品链接..."
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-cm-primary/40"
        />
      )}

      <ImageThumbnails images={images} onRemove={onRemoveImage} />
    </div>
  );
}

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
  const { images, pick, onFileChange, remove, clear, fileRef } = useImagePicker();
  const [productUrl, setProductUrl] = useState('');
  const [showUrl, setShowUrl] = useState(false);

  // reply (follow-up when AI asks a question)
  const replyPicker = useImagePicker();
  const [replyUrl, setReplyUrl] = useState('');
  const [showReplyUrl, setShowReplyUrl] = useState(false);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed && images.length === 0) return;
    if (isStreaming) return;
    sendMessage(trimmed, {
      images: images.length > 0 ? images : undefined,
      productUrl: productUrl.trim() || undefined,
    });
    setInput('');
    clear();
    setProductUrl('');
    setShowUrl(false);
  }, [input, images, isStreaming, productUrl, sendMessage, setInput, clear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleReply = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed && replyPicker.images.length === 0) return;
    if (isStreaming) return;
    sendMessage(trimmed, {
      images: replyPicker.images.length > 0 ? replyPicker.images : undefined,
      productUrl: replyUrl.trim() || undefined,
    });
    setInput('');
    replyPicker.clear();
    setReplyUrl('');
    setShowReplyUrl(false);
  }, [input, isStreaming, replyPicker, replyUrl, sendMessage, setInput]);

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
              描述你的产品，或直接上传产品图，AI 帮你出分镜脚本
            </p>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="比如：给我的保温杯做个视频，展示12小时保温和密封不漏水"
              className="w-full h-24 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-cm-primary/50"
            />

            <MediaInputRow
              images={images}
              onPickImage={pick}
              onFileChange={onFileChange}
              onRemoveImage={remove}
              fileRef={fileRef}
              productUrl={productUrl}
              onUrlChange={setProductUrl}
              showUrl={showUrl}
              onToggleUrl={() => setShowUrl((v) => !v)}
            />

            <div className="flex flex-wrap gap-2">
              {QUICK_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => { setInput(t.template); textareaRef.current?.focus(); }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:text-white hover:bg-white/10 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSend}
              disabled={(!input.trim() && images.length === 0) || isStreaming}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cm-primary text-cm-surface text-sm font-medium hover:bg-cm-primary/80 transition-colors disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
              开始规划
            </button>
          </>
        )}

        {/* 对话消息区 */}
        {chatPhase !== 'input' && (
          <div className="space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm bg-cm-primary/20 border border-cm-primary/20">
                      <p className="text-white/80 text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-cm-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] text-cm-primary font-bold">AI</span>
                    </div>
                    <p className="flex-1 text-white/85 text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}

            {isStreaming && chatPhase === 'confirming' && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-cm-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-[9px] text-cm-primary font-bold">AI</span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-cm-primary/60 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cm-primary/60 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cm-primary/60 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI 追问时的回复区（图片+链接+文字） */}
        {chatPhase === 'confirming' && !isStreaming && options.length === 0 && (
          <div className="space-y-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
              placeholder="回复 AI，或补充上传图片..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-cm-primary/50"
            />
            <MediaInputRow
              images={replyPicker.images}
              onPickImage={replyPicker.pick}
              onFileChange={replyPicker.onFileChange}
              onRemoveImage={replyPicker.remove}
              fileRef={replyPicker.fileRef}
              productUrl={replyUrl}
              onUrlChange={setReplyUrl}
              showUrl={showReplyUrl}
              onToggleUrl={() => setShowReplyUrl((v) => !v)}
            />
            <button
              onClick={handleReply}
              disabled={!input.trim() && replyPicker.images.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-cm-primary text-cm-surface text-sm font-medium hover:bg-cm-primary/80 transition-colors disabled:opacity-30"
            >
              <Send className="w-3.5 h-3.5" />
              发送
            </button>
          </div>
        )}

        {/* 风格选项卡片 */}
        {chatPhase === 'confirming' && !isStreaming && options.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/40 text-[10px] font-medium tracking-wide uppercase">选择拍摄风格</p>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                  opt.selected
                    ? 'border-cm-primary bg-cm-primary/10 text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.06]'
                }`}
              >
                <div className="text-xs font-semibold">{opt.label}</div>
                <div className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{opt.description}</div>
              </button>
            ))}
          </div>
        )}

        {/* 档位选择 */}
        {chatPhase === 'tier_select' && (
          <div className="space-y-3">
            <div className="px-3 py-1.5 rounded-lg bg-cm-primary/10 border border-cm-primary/20 inline-flex">
              <span className="text-xs text-cm-primary font-medium">✓ {selectedStyle}</span>
            </div>
            <p className="text-white/40 text-[10px] font-medium tracking-wide uppercase">选择视频时长</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(TIERS) as [TierType, typeof TIERS['info_flow']][]).map(([key, tier]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  className={`px-3 py-4 rounded-xl border text-center transition-all ${
                    selectedTier === key
                      ? 'border-cm-primary bg-cm-primary/10 text-white'
                      : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="text-sm font-bold">{tier.label}</div>
                  <div className="text-[11px] text-white/50 mt-1">{tier.duration}</div>
                  <div className="text-[10px] text-white/30 mt-0.5 leading-tight">{tier.desc}</div>
                </button>
              ))}
            </div>
            <button
              onClick={handleGenerate}
              disabled={!selectedTier || isStreaming}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cm-primary text-cm-surface text-sm font-medium hover:bg-cm-primary/80 transition-colors disabled:opacity-30"
            >
              <Sparkles className="w-4 h-4" />
              生成分镜脚本
            </button>
          </div>
        )}

        {/* 生成中 */}
        {chatPhase === 'generating' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-lg bg-cm-primary/10 border border-cm-primary/20 text-xs text-cm-primary">{selectedStyle}</span>
              <span className="px-2 py-1 rounded-lg bg-cm-primary/10 border border-cm-primary/20 text-xs text-cm-primary">{selectedTier && TIERS[selectedTier]?.label}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              正在生成分镜脚本...
            </div>
          </div>
        )}

        {/* 完成 */}
        {chatPhase === 'done' && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-400">✓ 已完成</span>
              <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40">{selectedStyle}</span>
            </div>
            <p className="text-white/30 text-xs">已自动保存到历史记录</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-3 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs shrink-0">
          {error}
        </div>
      )}
    </div>
  );
}
