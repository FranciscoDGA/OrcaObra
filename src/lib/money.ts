const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR');

export function formatMoney(value: number): string {
  return brlFormatter.format(value);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  return dateFormatter.format(date);
}

export function parseNumber(value: string): number {
  return Number(value.replace(',', '.'));
}
