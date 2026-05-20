import { mockProducts } from "@/lib/data/mock-products";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Product } from "@/lib/types/database";

export async function getActiveProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockProducts;
  }

  const supabase = await createClient();
  if (!supabase) return mockProducts;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return mockProducts;
  }

  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }

  return data as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return mockProducts.find((p) => p.id === id) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) return mockProducts.find((p) => p.id === id) ?? null;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Product;
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockProducts;
  }

  const supabase = await createClient();
  if (!supabase) return mockProducts;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Product[];
}
