import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Zap, LayoutGrid } from 'lucide-react';
import { getVisibleTools } from '@/tools/_registry';
import { ToolCard } from '@/tools/_shared/ToolCard';
import type { ToolDefinition } from '@/tools/types';

export function HomePage() {
  const navigate = useNavigate();
  const tools = getVisibleTools();

  const handleToolClick = (tool: ToolDefinition) => {
    if (tool.status === 'available' || tool.status === 'beta') {
      navigate(tool.route);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left: Brand + Description */}
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
              AI 创意工具平台
            </motion.h2>
            <motion.p
              className="font-body text-cm-on-surface-variant max-w-xs leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            >
              一站式 AI 驱动的影视创作工具集。从剧本分析到视觉生成，用智能技术加速创意落地。
            </motion.p>
          </div>
        </motion.div>

        {/* Right: Platform Overview */}
        <motion.div
          className="md:col-span-8 flex flex-col justify-center items-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden glass-stack flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-cm-primary/10 via-cm-secondary/5 to-cm-tertiary/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-cm-surface to-transparent opacity-80" />

            {/* Stats */}
            <div className="z-20 flex items-center gap-12 px-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-cm-primary/10 border border-cm-primary/20 flex items-center justify-center">
                  <LayoutGrid className="w-7 h-7 text-cm-primary" />
                </div>
                <span className="text-3xl font-headline font-bold text-white">{tools.length}</span>
                <span className="text-xs text-cm-on-surface-variant">AI 工具</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-cm-secondary/10 border border-cm-secondary/20 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-cm-secondary" />
                </div>
                <span className="text-3xl font-headline font-bold text-white">
                  {tools.filter((t) => t.status === 'available').length}
                </span>
                <span className="text-xs text-cm-on-surface-variant">已上线</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-cm-tertiary/10 border border-cm-tertiary/20 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-cm-tertiary" />
                </div>
                <span className="text-3xl font-headline font-bold text-white">
                  {tools.filter((t) => t.status === 'coming_soon').length}
                </span>
                <span className="text-xs text-cm-on-surface-variant">开发中</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Tool Grid */}
      <section className="max-w-7xl w-full mx-auto px-8 pb-20">
        <motion.h3
          className="text-lg font-headline font-semibold text-cm-on-surface mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          全部工具
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} onClick={() => handleToolClick(tool)} />
          ))}
        </div>
      </section>
    </>
  );
}
