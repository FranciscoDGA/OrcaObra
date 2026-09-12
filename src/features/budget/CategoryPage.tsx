import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import { categories } from '../../data/services';

export default function CategoryPage() {
  const navigate = useNavigate();
  const cats = categories();

  return (
    <div className="pb-6">
      <PageHeader title="Escolha a categoria" backTo="/budget/new" subtitle="Selecione o tipo de serviço" />

      <div className="grid grid-cols-2 gap-3 mt-2">
        {cats.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/services/${cat.name}`)}
            className="text-left"
          >
            <Card className="hover:border-teal-300 hover:shadow-md transition-all cursor-pointer h-full">
              <div className="flex flex-col items-center gap-3 py-2">
                <span className="text-4xl">{cat.icon}</span>
                <span className="font-semibold text-slate-800 text-sm text-center">{cat.name}</span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
