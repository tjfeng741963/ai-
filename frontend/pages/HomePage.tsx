import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CloudUpload, FileText, Clapperboard, Clock, MonitorPlay } from 'lucide-react';
import { UploadNovelModal } from '@/components/modals/UploadNovelModal';
import { UploadScriptModal } from '@/components/modals/UploadScriptModal';

export function HomePage() {
  const navigate = useNavigate();
  const [showNovelModal, setShowNovelModal] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left: Vertical Title + Description */}
        <motion.div
          className="md:col-span-4 flex gap-8 items-start"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="vertical-text font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
            <span className="gradient-text-hero">山海万象</span>
          </div>
          <div className="flex flex-col pt-2">
            <motion.h2
              className="font-headline text-2xl md:text-4xl font-bold text-cm-primary mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            >
              数字化叙事
              <br />
              重塑电影艺术
            </motion.h2>
            <motion.p
              className="font-body text-cm-on-surface-variant max-w-xs leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              利用顶尖 AI 技术将文字转化为史诗般的电影画面。每一次点击，都是一场关于想象力的宏大征途。
            </motion.p>
          </div>
        </motion.div>

        {/* Right: Featured Banner */}
        <motion.div
          className="md:col-span-8 flex flex-col justify-center items-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden glass-stack flex items-center justify-center relative group">
            {/* Cinematic gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cm-primary/10 via-cm-secondary/5 to-cm-tertiary/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-cm-surface to-transparent opacity-80" />

            {/* Content */}
            <div className="z-20 text-center px-6">
              <span className="inline-block px-3 py-1 rounded-full bg-cm-primary/10 border border-cm-primary/20 text-cm-primary text-[10px] font-label uppercase tracking-widest mb-4">
                Featured Studio
              </span>
              <h3 className="text-2xl md:text-3xl font-bold font-headline mb-2 text-white">
                苍穹之境 · 概念短片
              </h3>
              <div className="flex items-center justify-center gap-4 text-xs text-cm-on-surface-variant">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 02:45
                </span>
                <span className="flex items-center gap-1">
                  <MonitorPlay className="w-3.5 h-3.5" /> 4K Ultra
                </span>
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="mt-6 flex gap-2">
            <div className="w-8 h-1 bg-cm-primary rounded-full" />
            <div className="w-2 h-1 bg-white/20 rounded-full" />
            <div className="w-2 h-1 bg-white/20 rounded-full" />
            <div className="w-2 h-1 bg-white/20 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Bento Grid - 三大功能模块 */}
      <section className="max-w-7xl w-full mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
        {/* Card 1: 小说上传 */}
        <motion.div
          className="bento-card group relative rounded-3xl overflow-hidden frosted-glass neon-border-primary p-7 h-[340px] flex flex-col justify-between cursor-pointer"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          whileHover={{ borderColor: 'rgba(153, 247, 255, 0.4)' }}
          onClick={() => setShowNovelModal(true)}
        >
          {/* Background shimmer */}
          <div className="absolute inset-0 z-0 opacity-5 group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-br from-cm-primary/20 to-transparent" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-cm-primary/10 flex items-center justify-center mb-6 shadow-xl border border-cm-primary/20">
              <CloudUpload className="w-6 h-6 text-cm-primary" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-cm-on-surface mb-3">小说上传</h3>
            <p className="text-cm-on-surface-variant font-body text-sm leading-relaxed">
              上传文学原著，AI 深度理解语境，自动化生成宏大的世界观设定与视觉脚本预览。
            </p>
          </div>
          <div className="relative z-10 flex justify-end">
            <button className="px-6 py-2.5 bg-cm-surface-highest rounded-full border border-cm-outline-variant/30 text-xs font-semibold text-cm-on-surface hover:bg-cm-surface-bright transition-all duration-500">
              立即上传
            </button>
          </div>
        </motion.div>

        {/* Card 2: 剧本上传 */}
        <motion.div
          className="bento-card group relative rounded-3xl overflow-hidden frosted-glass neon-border-tertiary p-7 h-[340px] flex flex-col justify-between cursor-pointer"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65, ease: [0.2, 0.8, 0.2, 1] }}
          whileHover={{ borderColor: 'rgba(255, 172, 232, 0.4)' }}
          onClick={() => setShowScriptModal(true)}
        >
          <div className="absolute inset-0 z-0 opacity-5 group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-br from-cm-tertiary/20 to-transparent" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-cm-tertiary/10 flex items-center justify-center mb-6 shadow-xl border border-cm-tertiary/20">
              <FileText className="w-6 h-6 text-cm-tertiary" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-cm-on-surface mb-3">剧本上传</h3>
            <p className="text-cm-on-surface-variant font-body text-sm leading-relaxed">
              精准解析标准电影剧本，实时生成分镜草图与分场大纲，加速从文字到画面的生产效率。
            </p>
          </div>
          <div className="relative z-10 flex justify-end">
            <button className="px-6 py-2.5 bg-cm-surface-highest rounded-full border border-cm-outline-variant/30 text-xs font-semibold text-cm-on-surface hover:bg-cm-surface-bright transition-all duration-500">
              解析剧本
            </button>
          </div>
        </motion.div>

        {/* Card 3: 创作中心 */}
        <motion.div
          className="bento-card group relative rounded-3xl overflow-hidden frosted-glass neon-border-secondary p-7 h-[340px] flex flex-col justify-between cursor-pointer"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          whileHover={{ borderColor: 'rgba(236, 178, 255, 0.4)' }}
          onClick={() => navigate('/create')}
        >
          <div className="absolute inset-0 z-0 opacity-5 group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-br from-cm-secondary/20 to-transparent" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-cm-secondary/10 flex items-center justify-center mb-6 shadow-xl border border-cm-secondary/20">
              <Clapperboard className="w-6 h-6 text-cm-secondary" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-cm-on-surface mb-3">创作中心</h3>
            <p className="text-cm-on-surface-variant font-body text-sm leading-relaxed">
              全流程数字化制片系统，支持 4K 高清预演，打造属于你的数字化大片梦工厂。
            </p>
          </div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-cm-surface bg-slate-700" />
              <div className="w-6 h-6 rounded-full border-2 border-cm-surface bg-slate-600" />
              <div className="w-6 h-6 rounded-full border-2 border-cm-surface bg-slate-500" />
            </div>
            <button className="px-7 py-3 bg-gradient-to-r from-cm-primary to-cm-primary-dim text-cm-on-primary rounded-full text-sm font-bold shadow-cm-neon hover:scale-105 transition-all duration-500">
              开始创作
            </button>
          </div>
        </motion.div>
      </section>

      {/* Modals */}
      <UploadNovelModal
        open={showNovelModal}
        onClose={() => setShowNovelModal(false)}
      />
      <UploadScriptModal
        open={showScriptModal}
        onClose={() => setShowScriptModal(false)}
      />
    </>
  );
}
