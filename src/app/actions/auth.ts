"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
};

export async function signInAdmin(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const supabase = await createClient();
    if (!supabase) {
      return { error: "Supabase não configurado" };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: "E-mail ou senha inválidos" };
    }
  } catch (error) {
    console.error("[auth] signInAdmin", error);
    return { error: "Não foi possível entrar agora. Tente novamente." };
  }

  redirect("/admin");
}

export async function signOutAdmin() {
  try {
    const supabase = await createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error("[auth] signOutAdmin", error);
  }
  redirect("/admin/login");
}
