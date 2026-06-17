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

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { ok: false, error: "Banco de dados indisponível" };
    }

    if (data.id) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", data.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { data: maxRow } = await supabase
        .from("products")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextSortOrder = (maxRow?.sort_order ?? -1) + 1;

      const { error } = await supabase
        .from("products")
        .insert({ ...payload, sort_order: nextSortOrder });
      if (error) return { ok: false, error: error.message };
    }
  } catch (error) {
    console.error("[products] upsertProduct", error);
    return {
      ok: false,
      error: "Não foi possível salvar o produto. Tente novamente.",
    };
  }

  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export type ReorderProductResult = {
  ok: boolean;
  error?: string;
};

export async function reorderProduct(
  productId: string,
  direction: "up" | "down",
): Promise<ReorderProductResult> {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) return { ok: false, error: "Acesso negado" };

  try {
    const supabase = await createClient();
    if (!supabase) return { ok: false, error: "Banco indisponível" };

    const { data: current, error: currentError } = await supabase
      .from("products")
      .select("id, sort_order")
      .eq("id", productId)
      .single();

    if (currentError || !current) {
      return { ok: false, error: "Produto não encontrado" };
    }

    const { data: neighbor, error: neighborError } =
      direction === "up"
        ? await supabase
            .from("products")
            .select("id, sort_order")
            .lt("sort_order", current.sort_order)
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle()
        : await supabase
            .from("products")
            .select("id, sort_order")
            .gt("sort_order", current.sort_order)
            .order("sort_order", { ascending: true })
            .limit(1)
            .maybeSingle();

    if (neighborError) return { ok: false, error: neighborError.message };
    if (!neighbor) return { ok: true };

    const { error: updateCurrentError } = await supabase
      .from("products")
      .update({ sort_order: neighbor.sort_order })
      .eq("id", current.id);

    if (updateCurrentError) return { ok: false, error: updateCurrentError.message };

    const { error: updateNeighborError } = await supabase
      .from("products")
      .update({ sort_order: current.sort_order })
      .eq("id", neighbor.id);

    if (updateNeighborError) return { ok: false, error: updateNeighborError.message };
  } catch (error) {
    console.error("[products] reorderProduct", error);
    return {
      ok: false,
      error: "Não foi possível reordenar o produto. Tente novamente.",
    };
  }

  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath("/admin/produtos");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) return { ok: false, error: "Acesso negado" };

  try {
    const supabase = await createClient();
    if (!supabase) return { ok: false, error: "Banco indisponível" };

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
  } catch (error) {
    console.error("[products] deleteProduct", error);
    return {
      ok: false,
      error: "Não foi possível excluir o produto. Tente novamente.",
    };
  }

  revalidatePath("/catalogo");
  revalidatePath("/");
  revalidatePath("/admin/produtos");
  return { ok: true };
}

export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "whatsapp_sent" | "confirmed" | "cancelled",
) {
  const { isAdmin } = await getAdminSession();
  if (!isAdmin) return { ok: false, error: "Acesso negado" };

  try {
    const supabase = await createClient();
    if (!supabase) return { ok: false, error: "Banco indisponível" };

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) return { ok: false, error: error.message };
  } catch (error) {
    console.error("[products] updateOrderStatus", error);
    return {
      ok: false,
      error: "Não foi possível atualizar o status. Tente novamente.",
    };
  }

  revalidatePath("/admin/pedidos");
  return { ok: true };
}
