import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import { servicesForCategory, findService } from '../../data/services';
import { useBudgetStore } from '../../store/useBudgetStore';
import { createEmptyBudget } from '../../lib/budget-factory';

export default function ServicePage() {
  const navigate = useNavigate();
  const { category: categoryName } = useParams<{ category: string }>();
  const addBudget = useBudgetStore((s) => s.addBudget);

  const services = servicesForCategory(categoryName ?? '');

  function handleSelect(serviceType: string) {
    const service = findService(serviceType);
    if (!service) return;

    const emptyBudget = createEmptyBudget({
      serviceType: service.type,
      serviceCategory: service.category,
      projectMode: 'individual',
      validityDays: 15,
      approvalStatus: 'Pendente',
      status: 'Rascunho',
      pricingVersion: '',
    });

    const saved = addBudget(emptyBudget);
    navigate(`/budget/${saved.id}/step/1`);
  }

  return (
    <div className="pb-6">
      <PageHeader
        title={categoryName ?? 'Serviços'}
        backTo="/categories"
        subtitle="Escolha o serviço"
      />

      {services.length === 0 && (
        <p className="text-slate-500 text-center mt-8">Nenhum serviço encontrado para esta categoria.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
        {services.map((svc) => (
          <button
            key={svc.type}
            onClick={() => handleSelect(svc.type)}
            className="text-left"
          >
            <Card className="hover:border-teal-300 hover:shadow-md transition-all cursor-pointer h-full">
              <div className="flex flex-col items-center gap-3 py-2">
                <span className="text-3xl">{svc.icon}</span>
                <span className="font-semibold text-slate-800 text-sm text-center capitalize">
                  {svc.type.replace(/_/g, ' ')}
                </span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
