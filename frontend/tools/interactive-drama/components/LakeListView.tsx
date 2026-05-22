import { useEffect, useState } from 'react';
import { Plus, BookOpen, Play, Edit3, Trash2 } from 'lucide-react';
import { useCreatorStore } from '../store/creatorStore';
import { deleteLake } from '../services/api';

interface LakeListViewProps {
  onCreate: () => void;
  onEdit: (id: string) => void;
  onPlay: (id: string) => void;
}

export default function LakeListView({ onCreate, onEdit, onPlay }: LakeListViewProps) {
  const { lakeList, loadLakeList, createNewLake } = useCreatorStore();
  const [newTitle, setNewTitle] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadLakeList();
  }, [loadLakeList]);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const lake = await createNewLake(newTitle.trim());
    if (lake) {
      setNewTitle('');
      setShowCreate(false);
      onEdit(lake.id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这个故事湖？所有节点和边将被永久删除。')) return;
    await deleteLake(id);
    loadLakeList();
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">互动剧</h2>
          <p className="text-sm text-white/50 mt-1">AI 辅助设计互动剧本，6步引导 + 节点图编辑器</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(262,83%,63%)] hover:bg-[hsl(262,83%,58%)] text-white rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          新建故事湖
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="输入故事湖名称，如「修仙之路」"
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm mb-3 focus:outline-none focus:border-[hsl(262,83%,63%)]"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowCreate(false)}
              className="px-3 py-1.5 text-white/50 hover:text-white text-sm transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              className="px-4 py-1.5 bg-[hsl(262,83%,63%)] hover:bg-[hsl(262,83%,58%)] text-white rounded-lg text-sm transition-colors disabled:opacity-40"
            >
              创建并开始创作
            </button>
          </div>
        </div>
      )}

      {lakeList.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/40 text-sm">还没有故事湖</p>
            <p className="text-white/25 text-xs mt-1">创建一个互动剧，开始设计分支剧情</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {lakeList.map((lake) => (
            <div
              key={lake.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{lake.title}</h3>
                <p className="text-white/40 text-xs mt-0.5">
                  {lake.status === 'draft' && '草稿'}
                  {lake.status === 'generating' && '生成中'}
                  {lake.status === 'ready' && '已完成'}
                  {lake.status === 'published' && '已发布'}
                  {' · '}
                  {lake.updatedAt ? new Date(lake.updatedAt).toLocaleDateString('zh-CN') : ''}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(lake.id)}
                  className="p-2 text-white/40 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onPlay(lake.id)}
                  className="p-2 text-white/40 hover:text-[hsl(160,84%,39%)] hover:bg-white/[0.06] rounded-lg transition-colors"
                  title="播放验证"
                >
                  <Play size={16} />
                </button>
                <button
                  onClick={() => handleDelete(lake.id)}
                  className="p-2 text-white/40 hover:text-red-400 hover:bg-white/[0.06] rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
