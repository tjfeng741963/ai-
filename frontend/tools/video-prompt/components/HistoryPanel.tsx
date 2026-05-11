import { memo, useCallback } from 'react';
import { Clock, Trash2, RotateCcw } from 'lucide-react';
import { usePromptStore } from '../store/promptStore';
import { TIERS } from '../types';
import type { SessionRecord } from '../types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return '刚刚';
  if (diffHours < 24) return `${Math.floor(diffHours)}小时前`;
  if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}天前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

interface Props {
  onClose: () => void;
}

export default memo(function HistoryPanel({ onClose }: Props) {
  const sessions = usePromptStore((s) => s.sessions);
  const loadSession = usePromptStore((s) => s.loadSession);
  const deleteSession = usePromptStore((s) => s.deleteSession);

  const handleLoad = useCallback(
    (session: SessionRecord) => {
      loadSession(session);
      onClose();
    },
    [loadSession, onClose]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      deleteSession(id);
    },
    [deleteSession]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-white/40" />
          <h2 className="text-sm font-semibold text-white">历史记录</h2>
          {sessions.length > 0 && (
            <span className="text-[10px] text-white/30">{sessions.length} 条</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors text-xs"
        >
          ✕
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <Clock className="w-8 h-8 text-white/10 mb-3" />
            <p className="text-white/30 text-xs">还没有历史记录</p>
            <p className="text-white/20 text-[10px] mt-1">生成分镜脚本后会自动保存</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleLoad(session)}
                className="w-full text-left group px-3 py-3 rounded-xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] hover:border-white/15 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* 标题 */}
                    <p className="text-white/80 text-xs font-medium leading-snug truncate">
                      {session.title || '无标题'}
                    </p>

                    {/* 标签行 */}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {session.selectedStyle && (
                        <span className="px-1.5 py-0.5 rounded bg-cm-primary/15 text-cm-primary text-[9px] font-medium">
                          {session.selectedStyle}
                        </span>
                      )}
                      {session.selectedTier && TIERS[session.selectedTier] && (
                        <span className="px-1.5 py-0.5 rounded bg-white/8 text-white/40 text-[9px]">
                          {TIERS[session.selectedTier].label}
                        </span>
                      )}
                      <span className="text-white/25 text-[9px] ml-auto shrink-0">
                        {formatDate(session.createdAt)}
                      </span>
                    </div>

                    {/* 脚本预览 */}
                    {session.storyboardText && (
                      <p className="text-white/25 text-[10px] mt-1.5 leading-relaxed line-clamp-2">
                        {session.storyboardText.replace(/[#*`\-|]/g, '').trim()}
                      </p>
                    )}
                  </div>

                  {/* 操作 */}
                  <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-1 rounded text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors" title="加载">
                      <RotateCcw className="w-3 h-3" />
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, session.id)}
                      className="p-1 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
