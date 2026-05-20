import type { Product } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils/format";

export function getWhatsAppNumber(): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "5511999999999"
  );
}

export function buildWhatsAppUrl(message: string): string {
  const phone = getWhatsAppNumber();
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildOrderWhatsAppMessage(params: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  city?: string;
  state?: string;
  product: Pick<Product, "name" | "brand">;
  quantity: number;
  totalCents: number;
}): string {
  const location = [params.city, params.state].filter(Boolean).join(" - ");
  const lines = [
    "Ola! Gostaria de finalizar meu pedido na KR Servicos e Importacoes.",
    "",
    `Pedido: #${params.orderId.slice(0, 8).toUpperCase()}`,
    `Cliente: ${params.customerName}`,
    `Telefone: ${params.customerPhone}`,
    location ? `Cidade: ${location}` : null,
    "",
    `Produto: ${params.product.brand} - ${params.product.name}`,
    `Quantidade: ${params.quantity}`,
    `Total: ${formatCurrency(params.totalCents)}`,
    "",
    "Aguardo confirmacao. Obrigado!",
  ].filter((line): line is string => line !== null);

  return lines.join("\n");
}
