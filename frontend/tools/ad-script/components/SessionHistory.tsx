import { useEffect } from 'react';
import { X, Trash2, Plus, Clock, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { FLOW_STEPS } from '../types';

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

export default function SessionHistory() {
  const historyOpen = useChatStore((s) => s.historyOpen);
  const historyList = useChatStore((s) => s.historyList);
  const historyLoading = useChatStore((s) => s.historyLoading);
  const sessionId = useChatStore((s) => s.sessionId);
  const setHistoryOpen = useChatStore((s) => s.setHistoryOpen);
  const loadHistory = useChatStore((s) => s.loadHistory);
  const restoreSession = useChatStore((s) => s.restoreSession);
  const deleteHistorySession = useChatStore((s) => s.deleteHistorySession);
  const reset = useChatStore((s) => s.reset);

  useEffect(() => {
    if (historyOpen) loadHistory();
  }, [historyOpen, loadHistory]);

  if (!historyOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setHistoryOpen(false)}
      />

      <div className="relative w-[350px] h-full bg-[#1a1a2e] border-l border-white/10 flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/50" />
            历史记录
          </h3>
          <button
            onClick={() => setHistoryOpen(false)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-2 shrink-0">
          <button
            onClick={() => { reset(); setHistoryOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-cm-primary border border-cm-primary/20 hover:bg-cm-primary/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            新建对话
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
            </div>
          ) : historyList.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-white/30 text-xs">
              暂无历史记录
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {historyList.map((item) => {
                const isActive = item.id === sessionId;
                const stepLabel = FLOW_STEPS[Math.min(item.currentStep - 1, 5)]?.label || '';

                return (
                  <div
                    key={item.id}
                    onClick={() => !isActive && restoreSession(item.id)}
                    className={`group relative flex flex-col gap-1 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cm-primary/10 border border-cm-primary/20'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium truncate flex-1 ${isActive ? 'text-cm-primary' : 'text-white/80'}`}>
                        {item.title}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteHistorySession(item.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <span className="px-1.5 py-0.5 rounded bg-white/5">
                        第{item.currentStep}步 · {stepLabel}
                      </span>
                      <span>{formatRelativeTime(item.updatedAt)}</span>
                    </div>
                    {isActive && (
                      <span className="absolute top-2.5 right-3 text-[10px] text-cm-primary/60">当前</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
