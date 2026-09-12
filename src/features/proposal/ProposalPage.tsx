import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, FileText, Share2 } from 'lucide-react';
import { useBudgetStore } from '../../store/useBudgetStore';
import { formatMoney } from '../../lib/money';
import PageHeader from '../../components/layout/PageHeader';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import type { Budget } from '../../lib/types';

const PRICE_TYPES = [
  { value: 'minimum', label: 'Preço mínimo' },
  { value: 'recommended', label: 'Preço recomendado' },
  { value: 'full', label: 'Preço cheio' },
  { value: 'custom', label: 'Personalizado' },
];

export default function ProposalPage() {
  const { budgetId } = useParams<{ budgetId: string }>();
  const { budgets, updateBudget } = useBudgetStore();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState('recommended');
  const [customPrice, setCustomPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [finalPrice, setFinalPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!budgetId) return;
    const found = budgets.find((b) => b.id === budgetId) ?? null;
    setBudget(found);
    if (found) {
      setClientName('');
      setClientPhone('');
      setProjectName(found.projectName || found.description || '');
      setProjectDescription(found.projectDescription || found.description || '');
      setSelectedPriceType(found.selectedPriceType || 'recommended');
      setCustomPrice(found.customPrice?.toString() || '');
      setDiscount(found.discount?.toString() || '0');
      if (found.finalPrice) setFinalPrice(found.finalPrice);
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

  function handleSave() {
    if (!budget) return;
    updateBudget({
      ...budget,
      selectedPriceType,
      customPrice: selectedPriceType === 'custom' ? Number(customPrice) || null : null,
      discount: Number(discount) || 0,
      finalPrice,
      projectName,
      projectDescription,
    });
  }

  function handlePrint() {
    if (!budget || !finalPrice) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Proposta - ${projectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; color: #1e293b; padding: 40px; max-width: 700px; margin: 0 auto; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; letter-spacing: 0.5px; }
    .field { margin-bottom: 8px; }
    .field-label { font-size: 12px; color: #64748b; }
    .field-value { font-size: 15px; font-weight: 600; }
    .price-box { background: #f0fdfa; border: 2px solid #14b8a6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .price-label { font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .price-value { font-size: 32px; font-weight: 800; color: #0d9488; margin-top: 4px; }
    .note { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 8px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Proposta Comercial</h1>
  <p class="subtitle">OrçaObra — Orçamentos inteligentes</p>

  <div class="section">
    <div class="section-title">Cliente</div>
    <div class="field">
      <div class="field-label">Nome</div>
      <div class="field-value">${clientName || 'Não informado'}</div>
    </div>
    ${clientPhone ? `<div class="field"><div class="field-label">Telefone</div><div class="field-value">${clientPhone}</div></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Projeto</div>
    <div class="field">
      <div class="field-label">Nome</div>
      <div class="field-value">${projectName || budget.serviceType}</div>
    </div>
    <div class="field">
      <div class="field-label">Descrição</div>
      <div class="field-value">${projectDescription || budget.description}</div>
    </div>
  </div>

  <div class="price-box">
    <div class="price-label">Valor proposto</div>
    <div class="price-value">${formatMoney(finalPrice)}</div>
    ${Number(discount) > 0 ? `<div class="note">Desconto de ${discount}% aplicado</div>` : ''}
  </div>

  <div class="footer">
    <p>Esta proposta é válida por ${budget.validityDays} dias.</p>
    <p>Gerado por OrçaObra em ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  function handleShare() {
    if (!budget || !finalPrice) return;
    const text = `Proposta: ${projectName || budget.serviceType}\nValor: ${formatMoney(finalPrice)}\n\nGerado por OrçaObra`;

    if (navigator.share) {
      navigator.share({ title: `Proposta - ${projectName}`, text }).catch(() => {});
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
      <PageHeader title="Proposta" backTo="/" subtitle={budget.serviceType} />

      <div className="space-y-4">
        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Dados do cliente</h2>
          <div className="space-y-3">
            <Input
              label="Nome do cliente"
              placeholder="Ex: João Silva"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <Input
              label="Telefone"
              placeholder="Ex: (11) 99999-0000"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Detalhes do projeto</h2>
          <div className="space-y-3">
            <Input
              label="Nome do projeto"
              placeholder="Ex: Reforma do quarto"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <Input
              label="Descrição"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-800 mb-3">Precificação</h2>
          <div className="space-y-3">
            <Select
              label="Tipo de preço"
              value={selectedPriceType}
              onChange={(e) => setSelectedPriceType(e.target.value)}
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
              <p className="text-xs text-teal-600 mt-1">Este valor não inclui custos detalhados</p>
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
    </PageLayout>
  );
}
