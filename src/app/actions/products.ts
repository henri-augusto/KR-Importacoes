"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/format";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  brand: z.string().min(1),
  description: z.string().optional(),
  gender: z.enum(["masculino", "feminino", "unissex"]).optional(),
  family: z.string().optional(),
  volume_ml: z.coerce.number().int().positive().optional(),
  price_cents: z.coerce.number().int().positive(),
  compare_at_price_cents: z.coerce.number().int().positive().optional(),
  stock_quantity: z.coerce.number().int().min(0),
  image_url: z.string().url().optional().or(z.literal("")),
  is_featured: z.coerce.boolean().optional(),
  is_active: z.coerce.boolean().optional(),
});

export type ProductFormState = {
  ok: boolean;
  error?: string;
};

export async function upsertProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) {
    return { ok: false, error: "Acesso negado" };
  }

  const parsed = productSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    brand: formData.get("brand"),
    description: formData.get("description"),
    gender: formData.get("gender") || undefined,
    family: formData.get("family"),
    volume_ml: formData.get("volume_ml") || undefined,
    price_cents: formData.get("price_cents"),
    compare_at_price_cents: formData.get("compare_at_price_cents") || undefined,
    stock_quantity: formData.get("stock_quantity"),
    image_url: formData.get("image_url"),
    is_featured: formData.get("is_featured") === "on",
    is_active: formData.get("is_active") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, error: "Banco de dados indisponível" };
  }

  const data = parsed.data;
  const slug = slugify(`${data.brand}-${data.name}`);
  const payload = {
    name: data.name,
    slug,
    brand: data.brand,
    description: data.description || null,
    gender: data.gender ?? null,
    family: data.family || null,
    volume_ml: data.volume_ml ?? null,
    price_cents: data.price_cents,
    compare_at_price_cents: data.compare_at_price_cents ?? null,
    stock_quantity: data.stock_quantity,
    image_url: data.image_url || null,
    is_featured: data.is_featured ?? false,
    is_active: data.is_active ?? true,
  };

  if (data.id) {
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", data.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("products").insert(payload);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/catalogo");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function deleteProduct(id: string) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) return { ok: false, error: "Acesso negado" };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Banco indisponível" };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/catalogo");
  revalidatePath("/admin/produtos");
  return { ok: true };
}

export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "whatsapp_sent" | "confirmed" | "cancelled",
) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) return { ok: false, error: "Acesso negado" };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Banco indisponível" };

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/pedidos");
  return { ok: true };
}
