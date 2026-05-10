import { useState, useRef, type KeyboardEvent } from 'react';
import { Send, ImagePlus, Link } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [text, setText] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [taobaoLink, setTaobaoLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !taobaoLink.trim()) return;

    const message = taobaoLink.trim()
      ? `${trimmed}\n\n淘宝链接：${taobaoLink.trim()}`
      : trimmed;

    onSend(message);
    setText('');
    setTaobaoLink('');
    setShowLinkInput(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((images) => {
      onSend(text.trim() || '请分析这些产品图片', images);
      setText('');
    });

    e.target.value = '';
  };

  return (
    <div className="border-t border-white/10 p-3">
      {showLinkInput && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <Link className="w-4 h-4 text-cm-primary shrink-0" />
          <input
            type="text"
            value={taobaoLink}
            onChange={(e) => setTaobaoLink(e.target.value)}
            placeholder="粘贴淘宝商品链接..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cm-primary/50"
          />
          <button
            onClick={() => { setShowLinkInput(false); setTaobaoLink(''); }}
            className="text-xs text-white/40 hover:text-white/60"
          >
            取消
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 rounded-lg text-white/40 hover:text-cm-primary hover:bg-white/5 transition-colors disabled:opacity-30"
            title="上传产品图片"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowLinkInput(!showLinkInput)}
            disabled={disabled}
            className={`p-2 rounded-lg transition-colors disabled:opacity-30 ${
              showLinkInput ? 'text-cm-primary bg-cm-primary/10' : 'text-white/40 hover:text-cm-primary hover:bg-white/5'
            }`}
            title="淘宝链接"
          >
            <Link className="w-5 h-5" />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder || '描述你的产品，或直接发送产品图...'}
          rows={1}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-cm-primary/50 disabled:opacity-30"
          style={{ minHeight: '42px', maxHeight: '120px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !taobaoLink.trim())}
          className="p-2.5 rounded-xl bg-cm-primary text-cm-surface hover:bg-cm-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
