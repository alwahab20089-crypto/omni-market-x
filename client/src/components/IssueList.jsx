const styles = {
  error: 'border-red-300 bg-red-50 text-red-800',
  warning: 'border-amber-300 bg-amber-50 text-amber-800',
  info: 'border-slate-300 bg-slate-50 text-slate-700',
};

export default function IssueList({ validation }) {
  if (!validation) return null;
  return (
    <div>
      <p className="text-sm mb-2">
        Score: <b>{validation.score}</b>/100{' '}
        {validation.blocking && <span className="text-red-700">· blocked from approval</span>}
      </p>
      {validation.issues.length === 0 && <p className="text-sm text-green-700">No issues found.</p>}
      <ul className="space-y-2">
        {validation.issues.map((i) => (
          <li key={i.code} className={`border rounded px-3 py-2 text-sm ${styles[i.severity]}`}>
            <b>{i.severity.toUpperCase()}</b> · {i.code}: {i.message}
          </li>
        ))}
      </ul>
    </div>
  );
}