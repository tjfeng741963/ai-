import ReactMarkdown from 'react-markdown';
import { Check } from 'lucide-react';
import type { ChatMessage as ChatMessageType, OptionCard } from '../types';
import { stripOptionsMarker } from '../utils';


interface ChatMessageProps {
  message: ChatMessageType;
  isLatest?: boolean;
  onOptionSelect?: (option: OptionCard) => void;
}

export default function ChatMessage({ message, isLatest, onOptionSelect }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasOptions = message.options && message.options.length > 0;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-cm-primary/20 text-white rounded-br-sm'
            : 'bg-white/5 text-white/90 rounded-bl-sm'
        }`}
      >
        {message.images && message.images.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {message.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`产品图${i + 1}`}
                className="w-20 h-20 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
        {message.content ? (
          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{stripOptionsMarker(message.content)}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center gap-1 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cm-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cm-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cm-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        {hasOptions && (
          <div className="mt-3 flex flex-col gap-1.5 border-t border-white/5 pt-3">
            {message.options!.map((opt) => {
              const clickable = isLatest && !opt.selected && !!onOptionSelect;
              return (
                <button
                  key={opt.id}
                  onClick={() => clickable && onOptionSelect!(opt)}
                  disabled={!clickable}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all border ${
                    opt.selected
                      ? 'bg-cm-primary/15 border-cm-primary/30 text-cm-primary'
                      : clickable
                        ? 'border-white/10 hover:border-cm-primary/30 hover:bg-cm-primary/5 text-white/70 hover:text-white cursor-pointer'
                        : 'border-white/5 text-white/30 cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      opt.selected ? 'bg-cm-primary/30 text-cm-primary' : 'bg-white/10 text-white/40'
                    }`}>
                      {opt.selected ? <Check className="w-3 h-3" /> : opt.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-white/40 ml-1.5">{opt.description}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
