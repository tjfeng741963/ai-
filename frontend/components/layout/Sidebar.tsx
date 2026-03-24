import { NavLink } from 'react-router-dom';
import {
  Film,
  FolderOpen,
  Wand2,
  Users,
  Settings,
  Plus,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Film, label: '生成器' },
  { to: '#', icon: FolderOpen, label: '素材库' },
  { to: '#', icon: Wand2, label: '工作台' },
  { to: '#', icon: Users, label: '社区' },
  { to: '#', icon: Settings, label: '设置' },
] as const;

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-20 z-40 hidden md:flex flex-col items-center py-24 space-y-8 bg-[#0D1117]/80 backdrop-blur-[60px] border-r border-slate-800/20">
      {/* Logo */}
      <div className="flex flex-col items-center gap-1 mb-8">
        <span className="text-lg font-black text-cm-primary font-headline">万象</span>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-label">
          AI Cinema
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-6 w-full">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center mx-2 py-3 rounded-xl transition-all duration-500 ${
                isActive && to !== '#'
                  ? 'text-cm-primary bg-cm-primary/10'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="font-headline text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Create Button */}
      <button className="mt-auto w-12 h-12 rounded-full bg-gradient-to-br from-cm-primary to-cm-secondary flex items-center justify-center shadow-lg shadow-cm-primary/20 hover:scale-110 transition-transform duration-500">
        <Plus className="w-5 h-5 text-cm-on-primary" />
      </button>
    </aside>
  );
}
