import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
}

export default function PageHeader({ title, subtitle, backTo }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      {(backTo !== undefined) && (
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -ml-1"
        >
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
      )}
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
