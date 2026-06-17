import type { createServiceClient } from "@/lib/supabase/server";

export async function upsertCustomerByPhone(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerCity?: string;
    customerState?: string;
  },
): Promise<{ id: string } | null> {
  const phone = data.customerPhone;

  try {
    const { data: existing, error: lookupError } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (lookupError) {
      console.error("[orders] upsertCustomerByPhone lookup", lookupError);
      return null;
    }

    const payload = {
      name: data.customerName,
      phone,
      email: data.customerEmail || null,
      city: data.customerCity || null,
      state: data.customerState?.toUpperCase() || null,
    };

    if (existing) {
      const { data: updated, error } = await supabase
        .from("customers")
        .update(payload)
        .eq("id", existing.id)
        .select("id")
        .single();

      if (error || !updated) {
        if (error) console.error("[orders] upsertCustomerByPhone update", error);
        return null;
      }
      return updated;
    }

    const { data: created, error } = await supabase
      .from("customers")
      .insert(payload)
      .select("id")
      .single();

    if (error || !created) {
      if (error) console.error("[orders] upsertCustomerByPhone insert", error);
      return null;
    }
    return created;
  } catch (error) {
    console.error("[orders] upsertCustomerByPhone", error);
    return null;
  }
}
