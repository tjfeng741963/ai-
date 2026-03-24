import { Outlet, NavLink } from 'react-router-dom';
import { Home, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { getVisibleTools } from '@/tools/_registry';

export function AppLayout() {
  const tools = getVisibleTools();
  const availableTools = tools.filter((t) => t.status === 'available' || t.status === 'beta');

  return (
    <div className="min-h-screen bg-cm-surface text-cm-on-surface overflow-x-hidden selection:bg-cm-primary/30">
      <TopNav />
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 pl-0 md:pl-20 pt-20 flex flex-col items-center relative overflow-hidden">
        {/* Aurora 背景光效 */}
        <div className="absolute inset-0 z-0 hero-gradient" />
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cm-primary/5 rounded-full blur-[120px] pointer-events-none animate-cm-breathe" />
        <div
          className="absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] bg-cm-secondary/5 rounded-full blur-[100px] pointer-events-none animate-cm-breathe"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-cm-tertiary/3 rounded-full blur-[80px] pointer-events-none animate-cm-breathe"
          style={{ animationDelay: '1s' }}
        />

        {/* Page Content */}
        <div className="relative z-10 w-full">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-[#0D1117] border-t border-slate-800/10 pl-0 md:pl-20">
        <div className="flex flex-col items-center justify-center space-y-4 opacity-70">
          <div className="flex gap-8 text-[10px] font-label uppercase tracking-widest text-slate-500">
            <a className="hover:text-cyan-400 transition-colors" href="#">
              隐私政策
            </a>
            <a className="hover:text-cyan-400 transition-colors" href="#">
              服务条款
            </a>
            <a className="hover:text-cyan-400 transition-colors" href="#">
              加入我们
            </a>
          </div>
          <p className="font-label text-[10px] uppercase tracking-widest text-slate-600">
            &copy; 2026 山海万象 AI Tools. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 w-full h-16 bg-cm-surface-high/80 backdrop-blur-xl border-t border-cm-outline-variant/10 flex justify-around items-center z-50">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center ${isActive ? 'text-cm-primary' : 'text-slate-400'}`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-label">主页</span>
        </NavLink>
        {availableTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <NavLink
              key={tool.id}
              to={tool.route}
              className={({ isActive }) =>
                `flex flex-col items-center ${isActive ? 'text-cm-primary' : 'text-slate-400'}`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-label">{tool.name}</span>
            </NavLink>
          );
        })}
        <button className="flex flex-col items-center text-slate-400">
          <Settings className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-label">设置</span>
        </button>
      </div>
    </div>
  );
}
