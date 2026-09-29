import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Markets() {
  const [markets, setMarkets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/markets').then(setMarkets).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-4">
      {error && <p className="text-red-700 text-sm">{error}</p>}
      {markets.length === 0 && <p className="text-slate-500">No markets created yet. Approve a candidate first.</p>}
      {markets.map((m) => (
        <div key={m._id} className="bg-white border rounded p-4">
          <p className="font-medium">{m.payload?.question}</p>
          <p className="text-xs text-slate-500 mb-2">{m.externalId} · {m.status}</p>
          <pre className="text-xs bg-slate-50 border rounded p-3 overflow-x-auto">{JSON.stringify(m.payload, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}