import type { Budget, Client } from './types';
import { formatMoney } from './money';

const PAYMENT_LABELS: Record<string, string> = {
  a_vista: 'À vista',
  parcelado: 'Parcelado',
  por_etapa: 'Por etapa de obra',
  combinado: 'A combinar',
};

const TERM_LABELS: Record<string, string> = {
  sinal: 'Sinal de 30%',
  meio: '50% no meio',
  entrega: 'Pagamento na entrega',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
};

export function generateProposalHtml({
  budget,
  finalPrice,
  discount,
  selectedClient,
  paymentMethod,
  paymentTerms,
  validityDays,
  validityDate,
  agreedDays,
}: {
  budget: Budget;
  finalPrice: number;
  discount: number;
  selectedClient: Client | null;
  paymentMethod: string;
  paymentTerms: string[];
  validityDays: number;
  validityDate: string | null;
  agreedDays: number | null;
}): string {
  const clientSection = selectedClient
    ? `<div class="field"><div class="field-label">Nome</div><div class="field-value">${selectedClient.name}</div></div>
       ${selectedClient.phone ? `<div class="field"><div class="field-label">Telefone</div><div class="field-value">${selectedClient.phone}</div></div>` : ''}
       ${selectedClient.address ? `<div class="field"><div class="field-label">Endereço</div><div class="field-value">${selectedClient.address}</div></div>` : ''}
       ${selectedClient.city ? `<div class="field"><div class="field-label">Cidade</div><div class="field-value">${selectedClient.city}</div></div>` : ''}`
    : '<div class="field"><div class="field-value" style="color:#94a3b8">Nenhum cliente vinculado</div></div>';

  const paymentSection = paymentMethod
    ? `<div class="section">
         <div class="section-title">Pagamento</div>
         <div class="field">
           <div class="field-label">Forma de pagamento</div>
           <div class="field-value">${PAYMENT_LABELS[paymentMethod] || paymentMethod}</div>
         </div>
         ${paymentTerms.length > 0 ? `<div class="field"><div class="field-label">Condições</div><div class="field-value">${paymentTerms.map((t) => TERM_LABELS[t] || t).join(', ')}</div></div>` : ''}
       </div>`
    : '';

  const validitySection = validityDate
    ? `<div class="section">
         <div class="section-title">Validade</div>
         <div class="field">
           <div class="field-label">Esta proposta é válida por ${validityDays} dias</div>
           <div class="field-value">Até ${validityDate}</div>
         </div>
       </div>`
    : '';

  const daysSection = agreedDays
    ? `<div class="section">
         <div class="section-title">Prazo de execução</div>
         <div class="field">
           <div class="field-label">Prazo estimado</div>
           <div class="field-value">${agreedDays} dia${Number(agreedDays) !== 1 ? 's' : ''}</div>
         </div>
       </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Proposta - ${budget.projectName || budget.serviceType}</title>
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
    .divider { border-top: 1px solid #e2e8f0; margin: 16px 0; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Proposta Comercial</h1>
  <p class="subtitle">OrçaObra — Orçamentos inteligentes</p>

  <div class="section">
    <div class="section-title">Cliente</div>
    ${clientSection}
  </div>

  <div class="section">
    <div class="section-title">Projeto</div>
    <div class="field">
      <div class="field-label">Nome</div>
      <div class="field-value">${budget.projectName || budget.serviceType}</div>
    </div>
    <div class="field">
      <div class="field-label">Descrição</div>
      <div class="field-value">${budget.projectDescription || budget.description}</div>
    </div>
    ${budget.siteAddress ? `<div class="field"><div class="field-label">Endereço da obra</div><div class="field-value">${budget.siteAddress}${budget.city ? ' — ' + budget.city : ''}</div></div>` : ''}
  </div>

  ${daysSection}

  <div class="price-box">
    <div class="price-label">Valor proposto</div>
    <div class="price-value">${formatMoney(finalPrice)}</div>
    ${Number(discount) > 0 ? `<div class="note">Desconto de ${discount}% aplicado</div>` : ''}
  </div>

  ${paymentSection}
  ${validitySection}

  <div class="footer">
    <p>Gerado por OrçaObra em ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
</body>
</html>`;
}
