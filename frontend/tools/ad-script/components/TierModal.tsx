import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Film } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { generateScript } from '../services/api';
import { TIER_CONFIGS, TIER_CATEGORIES } from '../types';
import type { TierType } from '../types';

export default function TierModal() {
  const showTierModal = useChatStore((s) => s.showTierModal);
  const selectedTier = useChatStore((s) => s.selectedTier);
  const sessionId = useChatStore((s) => s.sessionId);
  const setShowTierModal = useChatStore((s) => s.setShowTierModal);
  const setSelectedTier = useChatStore((s) => s.setSelectedTier);
  const setScript = useChatStore((s) => s.setScript);
  const setIsStreaming = useChatStore((s) => s.setIsStreaming);
  const setError = useChatStore((s) => s.setError);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!sessionId || !selectedTier) return;

    setIsGenerating(true);
    setShowTierModal(false);
    setIsStreaming(true);
    setScript('');
    setError(null);

    try {
      const stream = generateScript({ sessionId, tier: selectedTier });
      for await (const event of stream) {
        if (event.type === 'delta' && event.content) {
          useChatStore.setState((s) => ({ script: (s.script || '') + event.content }));
        }
        if (event.type === 'error') {
          setError(event.error || '生成失败');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes('会话不存在') || err.message.includes('404')) {
          setError('会话已过期，请点击左上角重新开始对话');
          useChatStore.getState().reset();
        } else {
          setError(err.message);
        }
      }
    } finally {
      setIsStreaming(false);
      setIsGenerating(false);
    }
  };

  const feedTiers = TIER_CONFIGS.filter((t) => t.category === 'feed');
  const dramaTiers = TIER_CONFIGS.filter((t) => t.category === 'drama');
  const feedCategory = TIER_CATEGORIES[0];
  const dramaCategory = TIER_CATEGORIES[1];

  return (
    <AnimatePresence>
      {showTierModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowTierModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-cm-surface border border-white/10 rounded-2xl p-6 w-[620px] max-w-[92vw] max-h-[85vh] overflow-y-auto shadow-cm-neon"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">选择档位</h3>
              <button
                onClick={() => setShowTierModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 信息流广告 */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-cm-primary" />
                <span className="text-sm font-semibold text-white">{feedCategory.label}</span>
                <span className="text-[11px] text-white/40">{feedCategory.description}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {feedTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id as TierType)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selectedTier === tier.id
                        ? 'border-cm-primary bg-cm-primary/10 shadow-cm-neon'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{tier.label}</span>
                      <span className="text-[11px] text-cm-primary">{tier.duration}</span>
                    </div>
                    <div className="text-[11px] text-white/50 mb-1.5">{tier.description}</div>
                    <div className="flex gap-3 text-[10px] text-white/30">
                      <span>{tier.sceneCount}</span>
                      <span>{tier.wordCount}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-white/10 my-4" />

            {/* 广告短剧 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Film className="w-4 h-4 text-cm-secondary" />
                <span className="text-sm font-semibold text-white">{dramaCategory.label}</span>
                <span className="text-[11px] text-white/40">{dramaCategory.description}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {dramaTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id as TierType)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selectedTier === tier.id
                        ? 'border-cm-secondary bg-cm-secondary/10 shadow-cm-neon'
                        : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{tier.label}</span>
                      <span className="text-[11px] text-cm-secondary">{tier.duration}</span>
                    </div>
                    <div className="text-[11px] text-white/50 mb-1.5">{tier.description}</div>
                    <div className="flex gap-3 text-[10px] text-white/30">
                      <span>{tier.sceneCount}</span>
                      <span>{tier.wordCount}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedTier || isGenerating}
              className="w-full py-3 rounded-xl bg-cm-primary text-cm-surface font-medium hover:bg-cm-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isGenerating ? '生成中...' : '生成剧本'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
