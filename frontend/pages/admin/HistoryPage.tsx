import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Loader2, AlertCircle, X, Clock } from 'lucide-react';
import { fetchHistory, rollbackHistory } from './api';
import type { HistoryRecord } from './api';

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterTarget, setFilterTarget] = useState('');

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchHistory({
        target_type: filterType || undefined,
        target_id: filterTarget || undefined,
        limit: 100,
      });
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterTarget]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleRollback = async (id: number) => {
    if (!confirm('确定回滚到此版本？这将创建一条新的修改记录。')) return;
    try {
      setRollingBack(id);
      await rollbackHistory(id);
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : '回滚失败');
    } finally {
      setRollingBack(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-cm-on-surface-variant/40">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 过滤栏 */}
      <div className="flex gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-cm-surface-high/50 border border-cm-outline-variant/15 text-xs text-cm-on-surface outline-none"
        >
          <option value="">全部类型</option>
          <option value="prompt">提示词</option>
          <option value="config">配置</option>
        </select>
        <input
          type="text"
          placeholder="按目标 ID 过滤..."
          value={filterTarget}
          onChange={(e) => setFilterTarget(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-lg bg-cm-surface-high/50 border border-cm-outline-variant/15 text-xs text-cm-on-surface placeholder:text-cm-on-surface-variant/30 outline-none focus:border-cm-primary/40"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* 时间线 */}
      {history.length === 0 ? (
        <div className="text-center py-12 text-cm-on-surface-variant/30 text-xs">暂无修改记录</div>
      ) : (
        <div className="space-y-2">
          {history.map((record) => {
            const isExpanded = expandedId === record.id;
            const isRollingBack = rollingBack === record.id;
            const typeLabel = record.target_type === 'prompt' ? '提示词' : '配置';

            return (
              <div
                key={record.id}
                className="rounded-xl border border-cm-outline-variant/10 bg-cm-surface-high/20 overflow-hidden"
              >
                {/* 摘要行 */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cm-surface-high/30 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-cm-on-surface-variant/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        record.target_type === 'prompt'
                          ? 'bg-cm-primary/10 text-cm-primary'
                          : 'bg-cm-secondary/10 text-cm-secondary'
                      }`}>
                        {typeLabel}
                      </span>
                      <span className="font-semibold text-cm-on-surface truncate">{record.target_id}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-cm-on-surface-variant/40 shrink-0">
                    {new Date(record.created_at).toLocaleString('zh-CN')}
                  </span>
                </button>

                {/* 展开 diff */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    {record.old_value && (
                      <div>
                        <label className="block text-[10px] font-bold text-red-400/70 mb-1">旧值</label>
                        <pre className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-[10px] text-cm-on-surface/70 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {record.old_value.length > 500 ? `${record.old_value.slice(0, 500)}...` : record.old_value}
                        </pre>
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-green-400/70 mb-1">新值</label>
                      <pre className="p-2 rounded-lg bg-green-500/5 border border-green-500/10 text-[10px] text-cm-on-surface/70 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {record.new_value.length > 500 ? `${record.new_value.slice(0, 500)}...` : record.new_value}
                      </pre>
                    </div>
                    {record.old_value && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleRollback(record.id)}
                          disabled={isRollingBack}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cm-surface-high/50 border border-cm-outline-variant/15 text-cm-on-surface-variant hover:border-cm-primary/30 hover:text-cm-primary disabled:opacity-50 transition-colors"
                        >
                          {isRollingBack ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          回滚到此版本
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
