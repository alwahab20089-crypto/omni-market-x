import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['', 'pending_review', 'approved', 'created', 'rejected'];

export default function Queue() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('pending_review');
  const [run, setRun] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setItems(await api(`/candidates${status ? `?status=${status}` : ''}`));
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => { load(); }, [status]);

  const runDiscovery = async () => {
    setBusy(true);
    setError('');
    try {
      setRun(await api('/discovery/run', { method: 'POST' }));
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={runDiscovery}
          disabled={busy}
          className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {busy ? 'Running…' : 'Run discovery'}
        </button>
        <select className="border rounded px-2 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? s.replace('_', ' ') : 'all statuses'}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-700 text-sm">{error}</p>}

      {run && (
        <div className="bg-white border rounded p-3 text-sm">
          <b>Last run:</b> {JSON.stringify(run.stats)}
          {run.usedFallback && <p className="text-amber-700">Live feeds unavailable, so sample data was used.</p>}
          {run.errors?.map((e, i) => (
            <p key={i} className="text-red-700">{e.source}: {e.message}</p>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 && <p className="text-slate-500">No candidates. Run discovery to generate some.</p>}
        {items.map((c) => (
          <Link
            key={c._id}
            to={`/candidates/${c._id}`}
            className="block bg-white border rounded p-4 hover:border-slate-400"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-medium">{c.question}</p>
              <StatusBadge status={c.status} />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {c.category} · score {c.validation?.score ?? '–'} · {c.validation?.issues?.length ?? 0} issue(s) ·{' '}
              {c.sources.length} source(s) · seen {c.discoveryCount}×
              {c.duplicateOf && ' · possible duplicate'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}