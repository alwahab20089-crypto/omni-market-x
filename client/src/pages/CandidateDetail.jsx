import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';
import IssueList from '../components/IssueList';

const toInput = (d) => (d ? new Date(d).toISOString().slice(0, 16) : '');
const fromInput = (v) => (v ? new Date(`${v}:00Z`).toISOString() : null);

const Field = ({ label, children }) => (
  <label className="block text-sm">
    <span className="font-medium">{label}</span>
    {children}
  </label>
);
const inputCls = 'mt-1 w-full border rounded px-2 py-1 disabled:bg-slate-100';

export default function CandidateDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [f, setF] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState(null);

  const hydrate = (d) => {
    setC(d);
    setF({
      question: d.question,
      category: d.category || '',
      description: d.description || '',
      outcomes: (d.outcomes || []).join(', '),
      eventDate: toInput(d.eventDate),
      closeDate: toInput(d.closeDate),
      resolutionCriteria: d.resolutionCriteria || '',
      resolutionSource: d.resolutionSource || '',
    });
    setDirty(false);
  };

  useEffect(() => {
    api(`/candidates/${id}`).then(hydrate).catch((e) => setMsg({ type: 'error', text: e.message }));
  }, [id]);

  if (!c || !f) return <p>{msg ? msg.text : 'Loading…'}</p>;

  const editable = c.status === 'pending_review';
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setDirty(true); };

  const act = async (fn, ok) => {
    try {
      hydrate(await fn());
      setMsg({ type: 'ok', text: ok });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
      if (e.data?.candidate) hydrate(e.data.candidate);
    }
  };

  const save = () =>
    act(
      () =>
        api(`/candidates/${id}`, {
          method: 'PATCH',
          body: {
            question: f.question,
            category: f.category,
            description: f.description,
            outcomes: f.outcomes.split(',').map((s) => s.trim()).filter(Boolean),
            eventDate: fromInput(f.eventDate),
            closeDate: fromInput(f.closeDate),
            resolutionCriteria: f.resolutionCriteria,
            resolutionSource: f.resolutionSource.trim() || null,
          },
        }),
      'Saved and re-validated'
    );

  const approve = () => act(() => api(`/candidates/${id}/approve`, { method: 'POST' }), 'Approved');
  const reject = () => {
    const note = window.prompt('Reason for rejection (optional)') ?? null;
    if (note === null) return;
    act(() => api(`/candidates/${id}/reject`, { method: 'POST', body: { note } }), 'Rejected');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-sm text-slate-600 underline">← Queue</Link>
        <StatusBadge status={c.status} />
        {c.duplicateOf && (
          <Link to={`/candidates/${c.duplicateOf}`} className="text-sm text-amber-700 underline">
            possible duplicate
          </Link>
        )}
      </div>

      {msg && (
        <p className={`text-sm ${msg.type === 'error' ? 'text-red-700' : 'text-green-700'}`}>{msg.text}</p>
      )}
      {c.creationError && (
        <p className="text-sm text-red-700">
          Market creation failed: {c.creationError}. Click Approve to retry.
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white border rounded p-4 space-y-3">
          <h2 className="font-semibold">Candidate</h2>
          <Field label="Question"><input className={inputCls} disabled={!editable} value={f.question} onChange={set('question')} /></Field>
          <Field label="Category"><input className={inputCls} disabled={!editable} value={f.category} onChange={set('category')} /></Field>
          <Field label="Description"><textarea className={inputCls} rows={3} disabled={!editable} value={f.description} onChange={set('description')} /></Field>
          <Field label="Outcomes (comma-separated)"><input className={inputCls} disabled={!editable} value={f.outcomes} onChange={set('outcomes')} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Event date (UTC)"><input type="datetime-local" className={inputCls} disabled={!editable} value={f.eventDate} onChange={set('eventDate')} /></Field>
            <Field label="Closing date (UTC)"><input type="datetime-local" className={inputCls} disabled={!editable} value={f.closeDate} onChange={set('closeDate')} /></Field>
          </div>
          <Field label="Resolution criteria"><textarea className={inputCls} rows={4} disabled={!editable} value={f.resolutionCriteria} onChange={set('resolutionCriteria')} /></Field>
          <Field label="Resolution source URL"><input className={inputCls} disabled={!editable} value={f.resolutionSource} onChange={set('resolutionSource')} /></Field>

          <div className="flex gap-2 pt-2">
            {editable && (
              <button onClick={save} disabled={!dirty} className="border px-3 py-1.5 rounded disabled:opacity-40">
                Save changes
              </button>
            )}
            {(editable || c.status === 'approved') && (
              <button
                onClick={approve}
                disabled={dirty || (c.validation?.blocking && c.status === 'pending_review')}
                title={dirty ? 'Save changes first' : c.validation?.blocking ? 'Fix blocking errors first' : ''}
                className="bg-green-700 text-white px-3 py-1.5 rounded disabled:opacity-40"
              >
                Approve &amp; create market
              </button>
            )}
            {editable && (
              <button onClick={reject} className="bg-red-700 text-white px-3 py-1.5 rounded">Reject</button>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">Validation</h2>
            <IssueList validation={c.validation} />
          </section>

          <section className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">Supporting sources</h2>
            <ul className="space-y-3 text-sm">
              {c.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-blue-700 underline">{s.title}</a>
                  <p className="text-slate-500">{s.publisher} · {s.publishedAt && new Date(s.publishedAt).toLocaleString()}</p>
                  {s.snippet && <p className="text-slate-600">{s.snippet}</p>}
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border rounded p-4">
            <h2 className="font-semibold mb-2">History</h2>
            <ul className="text-xs text-slate-600 space-y-1">
              {c.history.map((h, i) => (
                <li key={i}>{new Date(h.at).toLocaleString()} · {h.action} · {h.by}{h.note ? ` · ${h.note}` : ''}</li>
              ))}
            </ul>
          </section>

          {c.marketId && (
            <p className="text-sm">
              Market created. <Link to="/markets" className="text-blue-700 underline">View structured market →</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}