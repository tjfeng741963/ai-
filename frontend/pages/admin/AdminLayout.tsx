import { useState } from 'react';
import { FileText, Settings, History, ChevronLeft } from 'lucide-react';
import { PromptListPage } from './PromptListPage';
import { ConfigListPage } from './ConfigListPage';
import { HistoryPage } from './HistoryPage';

type Tab = 'prompts' | 'configs' | 'history';

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: 'prompts', label: '提示词管理', icon: FileText },
  { id: 'configs', label: '全局配置', icon: Settings },
  { id: 'history', label: '修改历史', icon: History },
];

export function AdminLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('prompts');

  return (
    <div className="min-h-screen bg-cm-surface">
      {/* 顶栏 */}
      <header className="sticky top-0 z-30 bg-cm-surface-high/80 backdrop-blur-xl border-b border-cm-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="#/"
              className="flex items-center gap-1 text-cm-on-surface-variant/60 hover:text-cm-on-surface transition-colors text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              返回
            </a>
            <h1 className="text-sm font-headline font-bold text-cm-on-surface">
              后台管理
            </h1>
          </div>

          {/* Tab 切换 */}
          <nav className="flex gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cm-primary/10 text-cm-primary border border-cm-primary/20'
                      : 'text-cm-on-surface-variant/60 hover:text-cm-on-surface hover:bg-cm-surface-high/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'prompts' && <PromptListPage />}
        {activeTab === 'configs' && <ConfigListPage />}
        {activeTab === 'history' && <HistoryPage />}
      </main>
    </div>
  );
}
