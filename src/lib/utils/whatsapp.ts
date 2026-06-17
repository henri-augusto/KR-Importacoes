import type { Product } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils/format";

export function getWhatsAppNumber(): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "5519920099652"
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
    "Olá! Gostaria de finalizar meu pedido na KR Serviços e Importações.",
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
    "Aguardo confirmação. Obrigado!",
  ].filter((line): line is string => line !== null);

  return lines.join("\n");
}

export function buildPaidOrderWhatsAppMessage(params: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  city?: string;
  state?: string;
  productName: string;
  quantity: number;
  totalCents: number;
}): string {
  const location = [params.city, params.state].filter(Boolean).join(" - ");
  const lines = [
    "Olá! Meu pagamento foi confirmado na KR Serviços e Importações.",
    "",
    `Pedido: #${params.orderId.slice(0, 8).toUpperCase()}`,
    "Pagamento confirmado via Stripe.",
    "",
    `Cliente: ${params.customerName}`,
    `Telefone: ${params.customerPhone}`,
    location ? `Cidade: ${location}` : null,
    "",
    `Produto: ${params.productName}`,
    `Quantidade: ${params.quantity}`,
    `Total pago: ${formatCurrency(params.totalCents)}`,
    "",
    "Gostaria de combinar a entrega/envio. Obrigado!",
  ].filter((line): line is string => line !== null);

  return lines.join("\n");
}
