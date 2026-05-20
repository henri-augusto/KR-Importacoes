import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Order } from "@/lib/types/database";

export async function getOrdersAdmin(): Promise<Order[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customer:customers(*),
      order_items(*)
    `,
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Order[];
}
