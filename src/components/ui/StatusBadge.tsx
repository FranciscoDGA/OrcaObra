interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  'Rascunho': 'bg-slate-100 text-slate-700',
  'Enviado': 'bg-amber-50 text-amber-700',
  'Aprovado': 'bg-green-50 text-green-700',
  'Recusado': 'bg-red-50 text-red-700',
  'Convertido em obra': 'bg-blue-50 text-blue-700',
  'Expirado': 'bg-slate-100 text-slate-500',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = statusStyles[status] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles}`}>
      {status}
    </span>
  );
}
