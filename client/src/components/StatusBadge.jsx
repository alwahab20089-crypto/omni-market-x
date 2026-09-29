const styles = {
  pending_review: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  created: 'bg-green-100 text-green-800',
  rejected: 'bg-slate-200 text-slate-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] || ''}`}>
      {status.replace('_', ' ')}
    </span>
  );
}