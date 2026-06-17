import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Product } from "@/lib/types/database";

function logProductsError(context: string, error: unknown) {
  console.error(`[products] ${context}`, error);
}

export async function getActiveProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      if (error) logProductsError("getActiveProducts", error);
      return [];
    }

    return data as Product[];
  } catch (error) {
    logProductsError("getActiveProducts", error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      if (error) logProductsError("getProductBySlug", error);
      return null;
    }

    return data as Product;
  } catch (error) {
    logProductsError("getProductBySlug", error);
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      if (error) logProductsError("getProductById", error);
      return null;
    }
    return data as Product;
  } catch (error) {
    logProductsError("getProductById", error);
    return null;
  }
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data) {
      if (error) logProductsError("getAllProductsAdmin", error);
      return [];
    }
    return data as Product[];
  } catch (error) {
    logProductsError("getAllProductsAdmin", error);
    return [];
  }
}
