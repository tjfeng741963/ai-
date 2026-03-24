import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ToolDefinition } from '../types';

const ACCENT_MAP = {
  primary: {
    border: 'neon-border-primary',
    iconBg: 'bg-cm-primary/10',
    iconBorder: 'border-cm-primary/20',
    iconColor: 'text-cm-primary',
    shimmer: 'from-cm-primary/20',
    hover: 'rgba(153, 247, 255, 0.4)',
  },
  secondary: {
    border: 'neon-border-secondary',
    iconBg: 'bg-cm-secondary/10',
    iconBorder: 'border-cm-secondary/20',
    iconColor: 'text-cm-secondary',
    shimmer: 'from-cm-secondary/20',
    hover: 'rgba(236, 178, 255, 0.4)',
  },
  tertiary: {
    border: 'neon-border-tertiary',
    iconBg: 'bg-cm-tertiary/10',
    iconBorder: 'border-cm-tertiary/20',
    iconColor: 'text-cm-tertiary',
    shimmer: 'from-cm-tertiary/20',
    hover: 'rgba(255, 172, 232, 0.4)',
  },
} as const;

const STATUS_CONFIG = {
  available: { label: '可用', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  beta: { label: '测试中', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  coming_soon: { label: '即将上线', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
} as const;

interface ToolCardProps {
  tool: ToolDefinition;
  index: number;
  onClick: () => void;
}

export function ToolCard({ tool, index, onClick }: ToolCardProps) {
  const accent = ACCENT_MAP[tool.accentColor];
  const statusCfg = STATUS_CONFIG[tool.status];
  const isClickable = tool.status === 'available' || tool.status === 'beta';
  const Icon = tool.icon;

  return (
    <motion.div
      className={`bento-card group relative rounded-3xl overflow-hidden frosted-glass ${accent.border} p-7 h-[300px] flex flex-col justify-between ${
        isClickable ? 'cursor-pointer' : 'cursor-default opacity-75'
      }`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 + index * 0.15, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={isClickable ? { borderColor: accent.hover } : undefined}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Background shimmer */}
      <div
        className={`absolute inset-0 z-0 opacity-5 group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-br ${accent.shimmer} to-transparent`}
      />

      <div className="relative z-10">
        {/* Icon + Status badge row */}
        <div className="flex items-start justify-between mb-6">
          <div
            className={`w-12 h-12 rounded-2xl ${accent.iconBg} flex items-center justify-center shadow-xl border ${accent.iconBorder}`}
          >
            <Icon className={`w-6 h-6 ${accent.iconColor}`} />
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusCfg.bg} ${statusCfg.text} border ${statusCfg.border}`}
          >
            {statusCfg.label}
          </span>
        </div>

        <h3 className="text-2xl font-headline font-bold text-cm-on-surface mb-3">{tool.name}</h3>
        <p className="text-cm-on-surface-variant font-body text-sm leading-relaxed">{tool.description}</p>
      </div>

      {isClickable && (
        <div className="relative z-10 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-cm-surface-highest rounded-full border border-cm-outline-variant/30 text-xs font-semibold text-cm-on-surface hover:bg-cm-surface-bright transition-all duration-500">
            进入工具
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
