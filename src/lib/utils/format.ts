export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatOrderStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "Pendente",
    whatsapp_sent: "Enviado no WhatsApp",
    confirmed: "Confirmado",
    cancelled: "Cancelado",
  };
  return map[status] ?? status;
}

export function formatPaymentStatus(status: string | null): string {
  if (!status) return "—";
  const map: Record<string, string> = {
    awaiting_payment: "Aguardando pagamento",
    paid: "Pago",
    failed: "Falhou",
    refunded: "Reembolsado",
  };
  return map[status] ?? status;
}
