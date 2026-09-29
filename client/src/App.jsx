import { useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import Queue from './pages/Queue';
import CandidateDetail from './pages/CandidateDetail';
import Markets from './pages/Markets';

const link = ({ isActive }) =>
  `px-3 py-1 rounded ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`;

export default function App() {
  const [key, setKey] = useState(localStorage.getItem('reviewerKey') || '');
  const [name, setName] = useState(localStorage.getItem('reviewerName') || '');

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <h1 className="font-bold text-lg">OmniMarketX · Market Discovery</h1>
          <nav className="flex gap-2">
            <NavLink to="/" end className={link}>Review queue</NavLink>
            <NavLink to="/markets" className={link}>Markets</NavLink>
          </nav>
          <div className="ml-auto flex gap-2 text-sm">
            <input
              className="border rounded px-2 py-1 w-32"
              placeholder="Your name"
              value={name}
              onChange={(e) => { setName(e.target.value); localStorage.setItem('reviewerName', e.target.value); }}
            />
            <input
              className="border rounded px-2 py-1 w-44"
              type="password"
              placeholder="Reviewer key"
              value={key}
              onChange={(e) => { setKey(e.target.value); localStorage.setItem('reviewerKey', e.target.value); }}
            />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Queue />} />
          <Route path="/candidates/:id" element={<CandidateDetail />} />
          <Route path="/markets" element={<Markets />} />
        </Routes>
      </main>
    </div>
  );
}