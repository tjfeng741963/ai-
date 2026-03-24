import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Trash2,
  Download,
  Upload,
  Clock,
  FileText,
  X,
  ChevronRight,
  Sparkles,
  Zap,
  Edit3,
  Check,
  AlertTriangle,
} from 'lucide-react';
import type { RatingRecord } from '../services/storage';
import { exportRecordsAsJSON, importRecordsFromJSON } from '../services/storage';
import { GRADE_CONFIG } from '../types/rating';
import type { GradeLevel } from '../types/rating';

interface RatingHistoryProps {
  records: RatingRecord[];
  selectedId: string | null;
  onSelect: (record: RatingRecord) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onRename: (id: string, newName: string) => void;
  onClose: () => void;
  onImport: () => void;
}

export function RatingHistory({
  records,
  selectedId,
  onSelect,
  onDelete,
  onClear,
  onRename,
  onClose,
  onImport,
}: RatingHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = () => {
    const json = exportRecordsAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rating_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const count = importRecordsFromJSON(content);
        if (count > 0) {
          onImport();
          alert(`成功导入 ${count} 条记录`);
        } else {
          alert('没有新记录可导入');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const startEdit = (record: RatingRecord) => {
    setEditingId(record.id);
    setEditName(record.scriptName);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const formatDuration = (ms: number) => {
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}秒`;
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}分${remainingSecs}秒`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" />
          <h2 className="font-semibold text-gray-800">评级历史</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {records.length} 条
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-3 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={handleExport}
          disabled={records.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          导出
        </button>
        <button
          onClick={handleImport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <Upload className="w-4 h-4" />
          导入
        </button>
        <div className="flex-1" />
        {records.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>
        )}
      </div>

      {/* Clear Confirmation */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-red-50 border-b border-red-100"
          >
            <div className="flex items-center gap-2 text-red-700 text-sm mb-2">
              <AlertTriangle className="w-4 h-4" />
              确定要清空所有历史记录吗？此操作无法撤销。
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClear();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                确认清空
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Records List */}
      <div className="flex-1 overflow-y-auto p-2">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FileText className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">暂无评级记录</p>
            <p className="text-xs mt-1">完成评级后会自动保存</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record) => {
              const gradeConfig = GRADE_CONFIG[record.result.overallGrade as GradeLevel];
              const isSelected = selectedId === record.id;
              const isEditing = editingId === record.id;

              return (
                <motion.div
                  key={record.id}
                  layout
                  className={`
                    p-3 rounded-xl border cursor-pointer transition-all
                    ${isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}
                  `}
                  onClick={() => !isEditing && onSelect(record)}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Title & Grade */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveEdit();
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800 truncate">
                            {record.scriptName}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(record);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(record.createdAt)}
                        </span>
                        <span>·</span>
                        <span>{record.scriptLength.toLocaleString()} 字</span>
                        <span>·</span>
                        <span>{formatDuration(record.duration)}</span>
                      </div>
                    </div>

                    {/* Grade Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${gradeConfig.color}`}
                      >
                        {record.result.overallGrade}
                      </span>
                      <span className="text-sm text-gray-600">
                        {record.result.overallScore.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Analysis Mode & Preview */}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`
                        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                        ${record.analysisMode === 'advanced' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}
                      `}
                    >
                      {record.analysisMode === 'advanced' ? (
                        <>
                          <Sparkles className="w-3 h-3" />
                          深度分析
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3" />
                          快速分析
                        </>
                      )}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </div>

                  {/* Delete Button */}
                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(record.id);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 text-xs text-gray-400 text-center">
        最多保存 50 条记录，超出将自动删除最旧的记录
      </div>
    </motion.div>
  );
}

export default RatingHistory;
