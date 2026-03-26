import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, ChevronRight, Save, X, Loader2, AlertCircle, Check } from 'lucide-react';
import { fetchPrompts, updatePrompt } from './api';
import type { PromptTemplate } from './api';

// 工具 ID → 显示名称
const TOOL_LABELS: Record<string, string> = {
  'script-rating': '剧本评级',
  outpaint: 'AI 扩图',
  _global: '全局',
};

export function PromptListPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const loadPrompts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPrompts();
      setPrompts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPrompts(); }, [loadPrompts]);

  // 展开编辑
  const handleExpand = (prompt: PromptTemplate) => {
    if (expandedId === prompt.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(prompt.id);
    setEditContent(prompt.content);
    setEditName(prompt.name);
    setEditDesc(prompt.description);
  };

  // 保存
  const handleSave = async (id: string) => {
    try {
      setSaving(true);
      await updatePrompt(id, {
        name: editName,
        description: editDesc,
        content: editContent,
      });
      await loadPrompts();
      setSaveSuccess(id);
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 按工具分组
  const grouped = prompts.reduce<Record<string, PromptTemplate[]>>((acc, p) => {
    (acc[p.tool_id] ??= []).push(p);
    return acc;
  }, {});

  // 搜索过滤
  const filteredGrouped = Object.entries(grouped).reduce<Record<string, PromptTemplate[]>>(
    (acc, [toolId, items]) => {
      const filtered = search
        ? items.filter(
            (p) =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.id.toLowerCase().includes(search.toLowerCase()) ||
              p.description.toLowerCase().includes(search.toLowerCase()),
          )
        : items;
      if (filtered.length > 0) acc[toolId] = filtered;
      return acc;
    },
    {},
  );

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
      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cm-on-surface-variant/40" />
        <input
          type="text"
          placeholder="搜索提示词名称、ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-cm-surface-high/50 border border-cm-outline-variant/15 text-sm text-cm-on-surface placeholder:text-cm-on-surface-variant/30 outline-none focus:border-cm-primary/40 transition-colors"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      {/* 按工具分组列表 */}
      {Object.entries(filteredGrouped).map(([toolId, items]) => (
        <div key={toolId} className="rounded-2xl border border-cm-outline-variant/10 bg-cm-surface-high/20 overflow-hidden">
          {/* 分组标题 */}
          <div className="px-4 py-2.5 bg-cm-surface-high/30 border-b border-cm-outline-variant/10">
            <h3 className="text-xs font-bold text-cm-on-surface">
              {TOOL_LABELS[toolId] || toolId}
              <span className="ml-2 text-cm-on-surface-variant/40 font-normal">
                {items.length} 个模板
              </span>
            </h3>
          </div>

          {/* 模板列表 */}
          <div className="divide-y divide-cm-outline-variant/5">
            {items.map((prompt) => {
              const isExpanded = expandedId === prompt.id;
              const isSaved = saveSuccess === prompt.id;
              const varCount = (() => {
                try { return JSON.parse(prompt.variables).length; } catch { return 0; }
              })();

              return (
                <div key={prompt.id}>
                  {/* 行头 */}
                  <button
                    onClick={() => handleExpand(prompt)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cm-surface-high/30 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-cm-primary shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-cm-on-surface-variant/40 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-cm-on-surface truncate">{prompt.name}</span>
                        {prompt.is_dynamic === 1 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cm-tertiary/10 text-cm-tertiary font-bold">
                            动态
                          </span>
                        )}
                        {isSaved && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 font-bold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> 已保存
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-cm-on-surface-variant/50 mt-0.5 truncate">
                        {prompt.id}
                        {prompt.description && ` — ${prompt.description}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-cm-on-surface-variant/40 shrink-0">
                      {varCount > 0 && <span>{varCount} 变量</span>}
                      <span>{prompt.content.length.toLocaleString()} 字</span>
                    </div>
                  </button>

                  {/* 展开编辑区 */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 bg-cm-surface/50">
                      {/* 名称 + 描述 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-cm-on-surface-variant/60 mb-1">名称</label>
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-cm-surface-high/50 border border-cm-outline-variant/15 text-xs text-cm-on-surface outline-none focus:border-cm-primary/40"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-cm-on-surface-variant/60 mb-1">描述</label>
                          <input
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-cm-surface-high/50 border border-cm-outline-variant/15 text-xs text-cm-on-surface outline-none focus:border-cm-primary/40"
                          />
                        </div>
                      </div>

                      {/* 变量提示 */}
                      {varCount > 0 && (
                        <div className="text-[10px] text-cm-on-surface-variant/50 bg-cm-surface-high/30 rounded-lg px-3 py-2">
                          变量：
                          {JSON.parse(prompt.variables).map((v: { name: string }) => (
                            <code key={v.name} className="mx-1 px-1 py-0.5 rounded bg-cm-primary/10 text-cm-primary text-[9px]">
                              {`{${v.name}}`}
                            </code>
                          ))}
                        </div>
                      )}

                      {/* 内容编辑器 */}
                      <div>
                        <label className="block text-[10px] font-bold text-cm-on-surface-variant/60 mb-1">
                          提示词内容
                          <span className="ml-2 font-normal text-cm-on-surface-variant/40">
                            {editContent.length.toLocaleString()} 字
                          </span>
                        </label>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={Math.min(20, Math.max(6, editContent.split('\n').length + 2))}
                          className="w-full px-3 py-2 rounded-lg bg-cm-surface-high/50 border border-cm-outline-variant/15 text-xs text-cm-on-surface font-mono leading-relaxed outline-none focus:border-cm-primary/40 resize-y"
                          spellCheck={false}
                        />
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setExpandedId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-cm-on-surface-variant hover:bg-cm-surface-high/50 transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleSave(prompt.id)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cm-primary text-cm-on-primary text-xs font-semibold hover:bg-cm-primary/90 disabled:opacity-50 transition-colors"
                        >
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          保存
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(filteredGrouped).length === 0 && (
        <div className="text-center py-12 text-cm-on-surface-variant/30 text-xs">
          {search ? '未找到匹配的提示词' : '暂无提示词模板'}
        </div>
      )}
    </div>
  );
}
