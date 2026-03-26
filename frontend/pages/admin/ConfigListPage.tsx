import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, AlertCircle, X, Check } from 'lucide-react';
import { fetchConfigs, updateConfig } from './api';
import type { GlobalConfig } from './api';

export function ConfigListPage() {
  const [configs, setConfigs] = useState<GlobalConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchConfigs();
      setConfigs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfigs(); }, [loadConfigs]);

  const handleEdit = (config: GlobalConfig) => {
    setEditingKey(config.key);
    setEditValue(config.value);
  };

  const handleSave = async (key: string) => {
    try {
      setSaving(true);
      await updateConfig(key, { value: editValue });
      await loadConfigs();
      setEditingKey(null);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
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
      <p className="text-xs text-cm-on-surface-variant/50">
        全局配置影响所有工具的默认行为。修改后立即生效。
      </p>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-3 h-3" /></button>
        </div>
      )}

      <div className="rounded-2xl border border-cm-outline-variant/10 bg-cm-surface-high/20 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-cm-surface-high/30 border-b border-cm-outline-variant/10">
              <th className="text-left px-4 py-2.5 font-bold text-cm-on-surface-variant/60 w-40">配置项</th>
              <th className="text-left px-4 py-2.5 font-bold text-cm-on-surface-variant/60">值</th>
              <th className="text-left px-4 py-2.5 font-bold text-cm-on-surface-variant/60 w-48">说明</th>
              <th className="text-center px-4 py-2.5 font-bold text-cm-on-surface-variant/60 w-20">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cm-outline-variant/5">
            {configs.map((config) => {
              const isEditing = editingKey === config.key;
              const isSaved = savedKey === config.key;

              return (
                <tr key={config.key} className="hover:bg-cm-surface-high/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-cm-on-surface">{config.label || config.key}</div>
                    <div className="text-[10px] text-cm-on-surface-variant/40 font-mono mt-0.5">{config.key}</div>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSave(config.key);
                          if (e.key === 'Escape') setEditingKey(null);
                        }}
                        className="w-full px-2 py-1 rounded-md bg-cm-surface-high/50 border border-cm-primary/40 text-xs text-cm-on-surface font-mono outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <code className="text-cm-on-surface font-mono bg-cm-surface-high/30 px-2 py-0.5 rounded">
                          {config.value}
                        </code>
                        {isSaved && (
                          <span className="text-[9px] text-green-500 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> 已保存
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-cm-on-surface-variant/50">{config.description}</td>
                  <td className="px-4 py-3 text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingKey(null)}
                          className="p-1 rounded hover:bg-cm-surface-high/50 text-cm-on-surface-variant/60"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSave(config.key)}
                          disabled={saving}
                          className="p-1 rounded hover:bg-cm-primary/10 text-cm-primary"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(config)}
                        className="text-[10px] text-cm-primary hover:text-cm-primary/80 font-semibold"
                      >
                        编辑
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
