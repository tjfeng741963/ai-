import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { ScriptRating } from './pages/ScriptRating';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<ScriptRating />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
