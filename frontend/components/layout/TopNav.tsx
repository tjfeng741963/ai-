import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, Settings, Search } from 'lucide-react';

const TOP_LINKS = [
  { to: '/', label: '创作中心' },
  { to: '#works', label: '我的作品' },
  { to: '#inspiration', label: '灵感库' },
] as const;

export function TopNav() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-transparent backdrop-blur-xl shadow-cm-ambient">
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-headline tracking-tight">
          山海万象
        </span>
        <div className="hidden md:flex gap-6 font-headline tracking-tight text-sm">
          {TOP_LINKS.map(({ to, label }) => (
            <NavLink
              key={label}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                isActive && to !== '#works' && to !== '#inspiration'
                  ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1'
                  : 'text-slate-400 hover:text-slate-100 transition-colors duration-500'
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Center: Search */}
      <div
        className={`hidden lg:flex items-center gap-2 transition-all duration-500 ${
          searchFocused ? 'w-80' : 'w-64'
        }`}
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="搜索剧本、小说..."
            className="cm-search-input w-full pl-9 pr-4 py-2.5 rounded-full text-sm text-cm-on-surface placeholder:text-slate-500 outline-none font-body"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-cm-primary transition-all duration-500 hover:scale-105">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-400 hover:text-cm-primary transition-all duration-500 hover:scale-105">
          <Settings className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full border border-cm-outline-variant/20 overflow-hidden bg-gradient-to-br from-cm-primary/20 to-cm-secondary/20 flex items-center justify-center">
          <span className="text-sm font-bold text-cm-primary font-headline">U</span>
        </div>
      </div>
    </nav>
  );
}
