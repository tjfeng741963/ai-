import { useRef, useEffect, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Clapperboard, Megaphone, Camera, Film, Tv2, PlayCircle,
  Star, Wand2, Gamepad2, BookOpen, Music2, Radio, ArrowRight,
} from 'lucide-react';
import './space-landing.css';

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55;

// ─── FadingVideo ─────────────────────────────────────────────────────────────

interface FadingVideoProps {
  src: string;
  className: string;
  style?: React.CSSProperties;
}

function FadingVideo({ src, className, style }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);
  const startedRef = useRef(false);

  const fadeTo = useCallback((target: number, duration: number) => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    const video = videoRef.current;
    if (!video) return;
    const start = performance.now();
    const startOpacity = parseFloat(video.style.opacity) || 0;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      video!.style.opacity = String(startOpacity + (target - startOpacity) * t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || startedRef.current) return;
    startedRef.current = true;
    video.play().catch(() => {});
    fadeTo(1, FADE_MS);
  }, [fadeTo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.style.opacity = '0';
    startedRef.current = false;
    fadingOutRef.current = false;

    function onCanPlay() { startPlayback(); }
    function onTimeUpdate() {
      if (!fadingOutRef.current) {
        const remaining = video!.duration - video!.currentTime;
        if (remaining <= FADE_OUT_LEAD && remaining > 0) {
          fadingOutRef.current = true;
          fadeTo(0, FADE_MS);
        }
      }
    }
    function onEnded() {
      video!.style.opacity = '0';
      startedRef.current = false;
      fadingOutRef.current = false;
      setTimeout(() => { video!.currentTime = 0; startPlayback(); }, 100);
    }

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);

    if (video.readyState >= 3) startPlayback();
    const fallback = setTimeout(() => startPlayback(), 2000);

    return () => {
      clearTimeout(fallback);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
    };
  }, [fadeTo, startPlayback]);

  return (
    <video
      ref={videoRef} src={src} autoPlay muted playsInline preload="auto"
      className={className} style={{ ...style, opacity: 0 }}
    />
  );
}

// ─── BlurText ─────────────────────────────────────────────────────────────────

function BlurText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(ref, { amount: 0.1, once: true });
  return (
    <p ref={ref} className={className}
      style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', rowGap: '0.1em' }}>
      {text.split(' ').map((word, i) => (
        <motion.span key={i}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={isInView ? { filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'], opacity: [0, 0.5, 1], y: [50, -5, 0] } : {}}
          transition={{ duration: 0.7, times: [0, 0.5, 1], ease: 'easeOut', delay: i * 0.1 }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}>
          {word}
        </motion.span>
      ))}
    </p>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 17L17 7" /><path d="M7 7h10v10" />
    </svg>
  );
}
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="fixed top-4 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16">
      <div className="sl-liquid-glass w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="font-serif-display italic text-white text-xl">s</span>
      </div>
      <div className="hidden md:flex items-center sl-liquid-glass rounded-full px-1.5 py-1.5">
        {['首页', '短剧', '电影', '综艺', '工具集'].map((item) => (
          <a key={item} href="#"
            className="px-3 py-2 text-sm font-medium text-white/90 font-barlow hover:text-white transition-colors whitespace-nowrap">
            {item}
          </a>
        ))}
        <button className="bg-white text-black rounded-full px-4 py-2 text-sm font-medium font-barlow whitespace-nowrap flex items-center gap-1 ml-1">
          开始创作
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      <div className="w-12 h-12 invisible flex-shrink-0" />
    </nav>
  );
}

// ─── HeroSection ──────────────────────────────────────────────────────────────

function fi(delay: number) {
  return {
    initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
    animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: 'easeOut' as const, delay },
  };
}

function HeroSection() {
  return (
    <section className="relative min-h-screen bg-black flex flex-col overflow-hidden">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
        style={{ width: '120%', height: '120%' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1 flex flex-col items-center justify-center pt-24 px-4">
          {/* Badge */}
          <motion.div {...fi(0.4)} className="sl-liquid-glass rounded-full flex items-center px-1.5 py-1.5 mb-6">
            <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold font-barlow">全品类</span>
            <span className="text-sm text-white/90 pl-2 pr-3 font-barlow">AI 剧本创作平台 · 12 大创作 Agent 正式上线</span>
          </motion.div>

          <BlurText
            text="Tell Every Story Across Every World"
            className="text-6xl md:text-7xl lg:text-[5.5rem] font-serif-display italic text-white leading-[0.8] max-w-3xl tracking-[-4px] text-center"
          />

          <motion.p {...fi(0.8)}
            className="mt-4 text-sm md:text-base text-white max-w-2xl font-barlow font-light leading-tight text-center">
            从短剧到院线，从广告片到纪录片。12 大专业 Agent，AI 全程驱动，让每一个创意都能精准落地成剧本。
          </motion.p>

          <motion.div {...fi(1.1)} className="flex items-center gap-6 mt-6">
            <a href="#agents" className="sl-liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-medium text-white flex items-center gap-2 font-barlow">
              探索创作 Agent
              <ArrowUpRight className="h-5 w-5" />
            </a>
            <button className="text-white text-sm font-medium flex items-center gap-2 font-barlow">
              查看演示
              <PlayIcon className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div {...fi(1.3)} className="flex items-stretch gap-4 mt-8">
            <div className="sl-liquid-glass p-5 rounded-[1.25rem] flex flex-col" style={{ width: 200 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <div className="flex-1" />
              <div>
                <div className="text-4xl font-serif-display italic text-white tracking-[-1px] leading-none">12+</div>
                <div className="text-xs text-white font-barlow font-light mt-2">专业创作 Agent 类型</div>
              </div>
            </div>
            <div className="sl-liquid-glass p-5 rounded-[1.25rem] flex flex-col" style={{ width: 200 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
              <div className="flex-1" />
              <div>
                <div className="text-4xl font-serif-display italic text-white tracking-[-1px] leading-none">全程 AI</div>
                <div className="text-xs text-white font-barlow font-light mt-2">从灵感到完整剧本</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom brand row */}
        <motion.div {...fi(1.4)} className="flex flex-col items-center gap-4 pb-8">
          <div className="sl-liquid-glass rounded-full px-3.5 py-1">
            <span className="text-xs font-medium text-white font-barlow">覆盖全品类影视创作场景</span>
          </div>
          <div className="flex items-center gap-10 md:gap-14 flex-wrap justify-center px-4">
            {['短剧', '电影', '电视剧', '纪录片', '综艺'].map((name) => (
              <span key={name} className="font-serif-display italic text-white text-2xl md:text-3xl tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── AgentsSection ────────────────────────────────────────────────────────────

type AccentKey = 'cyan' | 'purple' | 'pink';

const ACCENT: Record<AccentKey, { ring: string; icon: string; tag: string }> = {
  cyan:   { ring: 'rgba(153,247,255,0.25)', icon: 'text-cyan-300',   tag: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' },
  purple: { ring: 'rgba(236,178,255,0.25)', icon: 'text-purple-300', tag: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
  pink:   { ring: 'rgba(255,172,232,0.25)', icon: 'text-pink-300',   tag: 'bg-pink-500/10 text-pink-300 border-pink-500/20' },
};

// ─── 配置区：在这里填写每个 Agent 的跳转链接 ───────────────────────────────
const AGENTS: {
  id: string;
  name: string;
  en: string;
  desc: string;
  icon: React.ElementType;
  accent: AccentKey;
  tag: string;
  link: string;
}[] = [
  { id: 'short-drama',  name: '短剧 Agent',    en: 'Short Drama',    desc: '竖屏情感、甜宠霸总、悬疑反转，爆款短剧批量创作',     icon: Clapperboard, accent: 'cyan',   tag: '最受欢迎', link: '#' },
  { id: 'ad-film',      name: '广告片 Agent',  en: 'Ad Film',        desc: '品牌TVC、信息流广告，精准传递卖点的商业剧本',         icon: Megaphone,    accent: 'purple', tag: '商业首选', link: '#' },
  { id: 'documentary',  name: '纪录片 Agent',  en: 'Documentary',    desc: '人文、自然、历史题材，真实叙事的深度内容创作',         icon: Camera,       accent: 'pink',   tag: '深度内容', link: '#' },
  { id: 'movie',        name: '电影 Agent',    en: 'Feature Film',   desc: '院线电影、类型片，从故事大纲到完整剧本一键生成',       icon: Film,         accent: 'cyan',   tag: '院线级',   link: '#' },
  { id: 'tv-series',    name: '电视剧 Agent',  en: 'TV Series',      desc: '古装、现代、职场题材，多集长剧情节架构设计',           icon: Tv2,          accent: 'purple', tag: '长剧专项', link: '#' },
  { id: 'short-film',   name: '微电影 Agent',  en: 'Short Film',     desc: '品牌故事、节日特辑、公益短片，10 分钟以内精品剧本',   icon: PlayCircle,   accent: 'pink',   tag: '短片创作', link: '#' },
  { id: 'variety',      name: '综艺 Agent',    en: 'Variety Show',   desc: '真人秀、脱口秀、竞技类节目，完整节目企划与脚本',       icon: Star,         accent: 'cyan',   tag: '节目策划', link: '#' },
  { id: 'animation',    name: '动画 Agent',    en: 'Animation',      desc: '国漫、IP 世界观构建，动画剧集分集大纲与场景剧本',     icon: Wand2,        accent: 'purple', tag: 'IP 创作',  link: '#' },
  { id: 'game',         name: '游戏剧情 Agent', en: 'Game Narrative', desc: '世界观设定、主线任务、角色关系，沉浸式游戏叙事体系',  icon: Gamepad2,     accent: 'pink',   tag: '互动叙事', link: '#' },
  { id: 'adaptation',   name: '网文改编 Agent', en: 'IP Adaptation',  desc: '小说 IP 剧本转化，保留原著精髓，重构影视化叙事',     icon: BookOpen,     accent: 'cyan',   tag: 'IP 改编',  link: '#' },
  { id: 'mv',           name: 'MV 剧情 Agent',  en: 'Music Video',    desc: '音乐视频叙事分镜，从歌词情感出发构建视觉故事',       icon: Music2,       accent: 'purple', tag: '视觉叙事', link: '#' },
  { id: 'livestream',   name: '直播脚本 Agent', en: 'Live Script',    desc: '带货直播、综艺直播，节奏把控与话术设计全覆盖',       icon: Radio,        accent: 'pink',   tag: '直播专项', link: '#' },
];

function AgentCard({ agent, index }: { agent: typeof AGENTS[number]; index: number }) {
  const accent = ACCENT[agent.accent];
  const Icon = agent.icon;

  return (
    <motion.a
      href={agent.link}
      target="_blank"
      rel="noopener noreferrer"
      className="sl-liquid-glass rounded-[1.25rem] p-6 flex flex-col cursor-pointer group no-underline"
      style={{ minHeight: 260 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ boxShadow: `0 0 0 1px ${accent.ring}, inset 0 1px 1px rgba(255,255,255,0.1)` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="sl-liquid-glass w-11 h-11 rounded-[0.75rem] flex items-center justify-center flex-shrink-0">
          <Icon className={`w-5 h-5 ${accent.icon}`} />
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${accent.tag} font-barlow whitespace-nowrap`}>
          {agent.tag}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-serif-display italic text-white text-2xl leading-none mb-1">{agent.name}</h3>
        <p className="text-[11px] text-white/50 font-barlow uppercase tracking-widest mb-3">{agent.en}</p>
        <p className="text-sm text-white/70 font-barlow font-light leading-snug">{agent.desc}</p>
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
        <span className="text-xs text-white/40 font-barlow">进入创作</span>
        <ArrowRight className={`w-4 h-4 ${accent.icon} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0 transition-transform`} />
      </div>
    </motion.a>
  );
}

function AgentsSection() {
  return (
    <section id="agents" className="relative bg-black py-24 px-8 md:px-16 lg:px-20">
      <FadingVideo
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* 轻遮罩，确保文字和卡片可读 */}
      <div className="absolute inset-0 z-[1] bg-black/40" />

      <div className="relative z-[2] max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-barlow text-white/50 mb-3 uppercase tracking-widest">// 选择创作模式</p>
          <h2 className="font-serif-display italic text-white text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-[-3px]">
            全品类 Agent<br />一站创作
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {AGENTS.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SpaceLandingPage() {
  return (
    <div style={{ background: '#000' }}>
      <HeroSection />
      <AgentsSection />
    </div>
  );
}
