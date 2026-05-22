import { useEffect, useState } from 'react';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { startPlaySession, makeChoice, getPlayState } from '../../services/api';
import RoadmapPanel from './RoadmapPanel';
import type { PlayerState, StoryNode, StoryEdge } from '../../types';

interface PlayerViewProps {
  lakeId: string;
  onBack: () => void;
  onBackToList: () => void;
}

export default function PlayerView({ lakeId, onBack, onBackToList }: PlayerViewProps) {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setLoading(true);
    setError(null);
    try {
      const state = await startPlaySession(lakeId);
      setPlayerState(state);
    } catch (e) {
      setError('无法启动播放会话');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    start();
  }, [lakeId]);

  const handleChoice = async (edgeId: string) => {
    if (!playerState) return;
    try {
      const state = await makeChoice(playerState.sessionId, edgeId);
      setPlayerState(state);
    } catch (e) {
      setError('操作失败');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-white/40 text-sm">加载中...</p>
      </div>
    );
  }

  if (error || !playerState) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">{error || '播放数据异常'}</p>
          <button onClick={start} className="px-4 py-2 bg-[hsl(262,83%,63%)] text-white rounded-lg text-sm">重试</button>
        </div>
      </div>
    );
  }

  const { currentNode, currentState, availableEdges, status } = playerState;

  return (
    <div className="h-full flex">
      {/* Player panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-white/40 hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <button onClick={onBackToList} className="text-white/30 hover:text-white/60 text-xs">
              退出播放
            </button>
          </div>
          <button onClick={start} className="flex items-center gap-1 text-white/40 hover:text-white text-sm">
            <RotateCcw size={14} />
            重置
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            {currentNode && (
              <>
                <div className="mb-6">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    currentNode.type === 'ending' ? 'bg-red-500/15 text-red-400' :
                    currentNode.type === 'start' ? 'bg-emerald-500/15 text-emerald-400' :
                    'bg-blue-500/15 text-blue-400'
                  }`}>
                    {currentNode.type}
                  </span>
                  <h2 className="text-xl font-semibold text-white mt-3 mb-4">{currentNode.title}</h2>
                  <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {currentNode.content}
                  </div>
                </div>

                {status === 'ended' ? (
                  <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
                    <p className="text-white/80 font-medium mb-2">剧终</p>
                    <p className="text-white/40 text-sm">你已到达故事结局</p>
                    <button onClick={start} className="mt-3 px-4 py-2 bg-white/[0.04] border border-white/10 text-white/70 rounded-lg text-sm hover:bg-white/[0.08]">
                      重新开始
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableEdges.map((edge) => (
                      <button
                        key={edge.id}
                        onClick={() => handleChoice(edge.id)}
                        className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[hsl(262,83%,63%)]/30 transition-all text-white text-sm"
                      >
                        {edge.optionText}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="p-3 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span>节点: {playerState.visitedNodeIds.length + 1}</span>
            {Object.entries(currentState).map(([key, val]) => (
              <span key={key}>{key}: {String(val)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap panel */}
      <div className="w-[280px] shrink-0 border-l border-white/10">
        <RoadmapPanel lakeId={lakeId} currentNodeId={currentNode?.id || null} visitedNodeIds={playerState.visitedNodeIds} />
      </div>
    </div>
  );
}
