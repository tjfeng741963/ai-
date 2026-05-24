import { useEffect } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export default function SessionHistory() {
  const historyOpen = useChatStore((s) => s.historyOpen);
  const historyList = useChatStore((s) => s.historyList);
  const historyLoading = useChatStore((s) => s.historyLoading);
  const setHistoryOpen = useChatStore((s) => s.setHistoryOpen);
  const loadHistory = useChatStore((s) => s.loadHistory);
  const restoreSession = useChatStore((s) => s.restoreSession);
  const deleteHistorySession = useChatStore((s) => s.deleteHistorySession);

  useEffect(() => {
    if (historyOpen) loadHistory();
  }, [historyOpen, loadHistory]);

  if (!historyOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/50" onClick={() => setHistoryOpen(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-cm-surface border-l border-white/10 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">历史记录</h3>
          <button
            onClick={() => setHistoryOpen(false)}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
            </div>
          ) : historyList.length === 0 ? (
            <p className="text-white/30 text-xs text-center py-12">暂无历史记录</p>
          ) : (
            historyList.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 group cursor-pointer"
                onClick={() => restoreSession(item.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{item.title || '未命名会话'}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    步骤 {item.currentStep}/3 · {new Date(item.updatedAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistorySession(item.id);
                  }}
                  className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
