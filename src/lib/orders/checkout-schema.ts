import { z } from "zod";
import { isValidBrazilianPhone, normalizePhone } from "@/lib/utils/phone";

const phoneSchema = z
  .string()
  .min(1, "Informe um telefone válido")
  .transform(normalizePhone)
  .refine(isValidBrazilianPhone, {
    message: "Informe um telefone válido (10 ou 11 dígitos)",
  });

export const checkoutSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  productName: z.string().min(1),
  productBrand: z.string().min(1),
  unitPriceCents: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(99),
  customerName: z.string().min(2, "Informe seu nome"),
  customerPhone: phoneSchema,
  customerEmail: z
    .string()
    .min(1, "Informe seu e-mail")
    .email("E-mail inválido"),
  customerCity: z.string().optional(),
  customerState: z.string().max(2).optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
