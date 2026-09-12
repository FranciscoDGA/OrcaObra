import { useNavigate } from 'react-router-dom';
import { User, Building2 } from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';

export default function NewBudgetPage() {
  const navigate = useNavigate();

  return (
    <div className="pb-6">
      <PageHeader title="Novo orçamento" backTo="/" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        <button
          onClick={() => navigate('/categories')}
          className="text-left"
        >
          <Card className="hover:border-teal-300 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                <User size={24} className="text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Serviço individual</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Orçar um serviço específico como pintura, azulejo, fundação...
                </p>
              </div>
            </div>
          </Card>
        </button>

        <button
          onClick={() => navigate('/budget/new/full')}
          className="text-left"
        >
          <Card className="hover:border-teal-300 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Building2 size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Obra completa</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Criar orçamento completo de construção ou reforma
                </p>
              </div>
            </div>
          </Card>
        </button>
      </div>
    </div>
  );
}
