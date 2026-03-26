import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { getRoutableTools } from './tools/_registry';

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));

function ToolLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-2 border-cm-primary border-t-transparent rounded-full" />
    </div>
  );
}

export default function App() {
  const routableTools = getRoutableTools();

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          {routableTools.map((tool) => (
            <Route
              key={tool.id}
              path={tool.route}
              element={
                <Suspense fallback={<ToolLoadingFallback />}>
                  <tool.component />
                </Suspense>
              }
            />
          ))}
          {/* Admin 管理后台 */}
          <Route
            path="/admin"
            element={
              <Suspense fallback={<ToolLoadingFallback />}>
                <AdminLayout />
              </Suspense>
            }
          />
          {/* 向后兼容旧路由 */}
          <Route path="/create" element={<Navigate to="/tools/script-rating" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
