"use client";

import { useActionState } from "react";
import { signInAdmin, type AuthFormState } from "@/app/actions/auth";

const initial: AuthFormState = {};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(signInAdmin, initial);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="min-h-12 rounded-xl border border-zinc-200 px-4 text-base outline-none focus:border-zinc-400"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-12 rounded-xl border border-zinc-200 px-4 text-base outline-none focus:border-zinc-400"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-zinc-900 text-base font-medium text-white disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
