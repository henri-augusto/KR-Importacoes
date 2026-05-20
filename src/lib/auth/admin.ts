import { createClient } from "@/lib/supabase/server";

export async function getAdminSession() {
  const supabase = await createClient();
  if (!supabase) return { user: null, isAdmin: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  return {
    user,
    isAdmin: profile?.role === "admin",
  };
}
