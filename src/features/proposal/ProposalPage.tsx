import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Save, FileText, Share2, User, CreditCard, Calendar } from 'lucide-react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useClientStore } from '../../store/useClientStore';
import { formatMoney } from '../../lib/money';
import { generateProposalHtml } from '../../lib/proposal-template';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ClientPickerModal from '../../components/ui/ClientPickerModal';
import type { Budget, PriceType, PaymentMethod, PaymentTerm } from '../../lib/types';

const PRICE_TYPES: { value: PriceType; label: string }[] = [
  { value: 'minimum', label: 'Preço mínimo' },
  { value: 'recommended', label: 'Preço recomendado' },
  { value: 'full', label: 'Preço cheio' },
  { value: 'custom', label: 'Personalizado' },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: '', label: 'Selecione...' },
  { value: 'a_vista', label: 'À vista' },
  { value: 'parcelado', label: 'Parcelado' },
  { value: 'por_etapa', label: 'Por etapa de obra' },
  { value: 'combinado', label: 'A combinar' },
];

const PAYMENT_TERMS_OPTIONS: { value: PaymentTerm; label: string }[] = [
  { value: 'sinal', label: 'Sinal de 30%' },
  { value: 'meio', label: '50% no meio' },
  { value: 'entrega', label: 'Pagamento na entrega' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'mensal', label: 'Mensal' },
];

export default function ProposalPage() {
  const { budgetId } = useParams<{ budgetId: string }>();
  const { budgets, updateBudget } = useBudgetStore();
  const { clients, loadClients } = useClientStore();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [selectedPriceType, setSelectedPriceType] = useState<PriceType>('recommended');
  const [customPrice, setCustomPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [validityDays, setValidityDays] = useState('30');
  const [agreedDays, setAgreedDays] = useState('');

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (!budgetId) return;
    const found = budgets.find((b) => b.id === budgetId) ?? null;
    setBudget(found);
    if (found) {
      setClientId(found.clientId || null);
      setSelectedPriceType(found.selectedPriceType || 'recommended');
      setCustomPrice(found.customPrice?.toString() || '');
      setDiscount(found.discount?.toString() || '0');
      if (found.finalPrice) setFinalPrice(found.finalPrice);
      setPaymentMethod(found.paymentMethod || '');
      setPaymentTerms(found.paymentTerms || []);
      setValidityDays((found.validityDays || 30).toString());
      setAgreedDays(found.agreedDays?.toString() || '');
    }
  }, [budgetId, budgets]);

  useEffect(() => {
    if (!budget) return;
    let base = 0;
    switch (selectedPriceType) {
      case 'minimum':
        base = budget.minimumPrice ?? 0;
        break;
      case 'recommended':
        base = budget.recommendedPrice ?? 0;
        break;
      case 'full':
        base = budget.fullPrice ?? 0;
        break;
      case 'custom':
        base = Number(customPrice) || 0;
        break;
    }
    const discountValue = Number(discount) || 0;
    const discounted = base * (1 - discountValue / 100);
    setFinalPrice(discounted > 0 ? discounted : null);
  }, [budget, selectedPriceType, customPrice, discount]);

  const togglePaymentTerm = useCallback((term: PaymentTerm) => {
    setPaymentTerms((prev) =>
      prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term]
    );
  }, []);

  const selectedClient = clients.find((c) => c.id === clientId);
  const validityDate = validityDays
    ? new Date(Date.now() + Number(validityDays) * 86400000).toLocaleDateString('pt-BR')
    : null;

  function handleSave() {
    if (!budget) return;
    updateBudget({
      ...budget,
      clientId,
      selectedPriceType,
      customPrice: selectedPriceType === 'custom' ? Number(customPrice) || null : null,
      discount: Number(discount) || 0,
      finalPrice,
      paymentMethod,
      paymentTerms,
      validityDays: Number(validityDays) || 30,
      expiresAt: validityDate,
      agreedDays: agreedDays ? Number(agreedDays) : null,
      updatedAt: new Date().toISOString(),
    });
  }

  function handlePrint() {
    if (!budget || !finalPrice) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = generateProposalHtml({
      budget,
      finalPrice,
      discount: Number(discount) || 0,
      selectedClient: selectedClient ?? null,
      paymentMethod,
      paymentTerms,
      validityDays: Number(validityDays) || 30,
      validityDate,
      agreedDays: agreedDays ? Number(agreedDays) : null,
    });

    printWindow.document.write(html);
    printWindow.document.close();
  }

  function handleShare() {
    if (!budget || !finalPrice) return;
    const clientLine = selectedClient ? `Cliente: ${selectedClient.name}\n` : '';
    const text = `Proposta: ${budget.projectName || budget.serviceType}\n${clientLine}Valor: ${formatMoney(finalPrice)}\n${validityDate ? `Válida até: ${validityDate}\n` : ''}\nGerado por OrçaObra`;

    if (navigator.share) {
      navigator.share({ title: `Proposta - ${budget.projectName || budget.serviceType}`, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  if (!budget) {
    return (
      <PageLayout>
        <PageHeader title="Proposta" backTo="/" />
        <Card>
          <p className="text-slate-500 text-center py-8">Orçamento não encontrado.</p>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader title="Proposta" backTo={`/budget/${budgetId}/result`} subtitle={budget.serviceType} />

      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-800">Cliente</h2>
            </div>
            <button
              onClick={() => setShowClientPicker(true)}
              className="text-sm text-teal-600 font-semibold hover:text-teal-700"
            >
              {selectedClient ? 'Trocar' : 'Selecionar'}
            </button>
          </div>
          {selectedClient ? (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="font-semibold text-slate-800">{selectedClient.name}</p>
              <div className="flex gap-3 text-sm text-slate-500 mt-0.5">
                {selectedClient.phone && <span>{selectedClient.phone}</span>}
                {selectedClient.city && <span>{selectedClient.city}</span>}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClientPicker(true)}
              className="w-full p-3 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-colors text-sm"
            >
              Toque para selecionar um cliente
            </button>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-800">Pagamento</h2>
          </div>
          <div className="space-y-3">
            <Select
              label="Forma de pagamento"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              options={PAYMENT_METHODS}
            />
            {paymentMethod && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Condições de pagamento</p>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_TERMS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => togglePaymentTerm(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        paymentTerms.includes(opt.value)
                          ? 'border-teal-300 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-800">Validade e prazo</h2>
          </div>
          <div className="space-y-3">
            <Input
              label="Validade da proposta (dias)"
              type="number"
              min="1"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
            />
            {validityDate && (
              <p className="text-sm text-slate-500">
                Proposta válida até <strong>{validityDate}</strong>
              </p>
            )}
            <Input
              label="Prazo de execução (dias)"
              type="number"
              min="1"
              value={agreedDays}
              onChange={(e) => setAgreedDays(e.target.value)}
              help="Prazo estimado para conclusão da obra"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Precificação</h2>
          <div className="space-y-3">
            <Select
              label="Tipo de preço"
              value={selectedPriceType}
              onChange={(e) => setSelectedPriceType(e.target.value as PriceType)}
              options={PRICE_TYPES}
            />

            {selectedPriceType === 'custom' && (
              <Input
                label="Preço personalizado (R$)"
                type="number"
                min="0"
                step="0.01"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
              />
            )}

            <Input
              label="Desconto (%)"
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          {finalPrice !== null && finalPrice > 0 && (
            <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
              <p className="text-sm text-teal-700 font-semibold uppercase tracking-wide">Valor final</p>
              <p className="text-3xl font-extrabold text-teal-700 mt-1">{formatMoney(finalPrice)}</p>
              {Number(discount) > 0 && (
                <p className="text-xs text-teal-600 mt-1">Desconto de {discount}% aplicado</p>
              )}
            </div>
          )}
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1 inline" />
            Compartilhar
          </Button>
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <FileText className="w-4 h-4 mr-1 inline" />
            Gerar PDF
          </Button>
        </div>

        <Button fullWidth onClick={handleSave}>
          <Save className="w-4 h-4 mr-2 inline" />
          Salvar proposta
        </Button>
      </div>

      <ClientPickerModal
        isOpen={showClientPicker}
        onClose={() => setShowClientPicker(false)}
        onSelect={setClientId}
        selectedClientId={clientId}
      />
    </PageLayout>
  );
}
