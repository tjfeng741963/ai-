import { NavLink } from 'react-router-dom';
import { Home, Settings } from 'lucide-react';
import { getVisibleTools } from '@/tools/_registry';

export function Sidebar() {
  const tools = getVisibleTools();

  return (
    <aside className="fixed left-0 top-0 h-full w-20 z-40 hidden md:flex flex-col items-center py-24 space-y-8 bg-[#0D1117]/80 backdrop-blur-[60px] border-r border-slate-800/20">
      {/* Logo */}
      <div className="flex flex-col items-center gap-1 mb-8">
        <span className="text-lg font-black text-cm-primary font-headline">万象</span>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-label">
          AI Tools
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4 w-full">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center mx-2 py-3 rounded-xl transition-all duration-500 ${
              isActive
                ? 'text-cm-primary bg-cm-primary/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`
          }
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="font-headline text-[10px] font-medium">主页</span>
        </NavLink>

        {/* Divider */}
        <div className="mx-4 h-px bg-slate-800/30" />

        {/* Tools from registry */}
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isDisabled = tool.status === 'coming_soon';

          return (
            <NavLink
              key={tool.id}
              to={isDisabled ? '#' : tool.route}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center mx-2 py-3 rounded-xl transition-all duration-500 ${
                  isDisabled
                    ? 'text-slate-600 cursor-default'
                    : isActive
                      ? 'text-cm-primary bg-cm-primary/10'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`
              }
              onClick={isDisabled ? (e) => e.preventDefault() : undefined}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="font-headline text-[10px] font-medium">{tool.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Settings */}
      <button className="mt-auto flex flex-col items-center justify-center mx-2 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all duration-500">
        <Settings className="w-5 h-5 mb-1" />
        <span className="font-headline text-[10px] font-medium">设置</span>
      </button>
    </aside>
  );
}
