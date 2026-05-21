import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-zinc-200/60 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
        Administração
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
        Entrar no painel
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Acesso restrito para gestão de produtos e pedidos.
      </p>
      <AdminLoginForm />
    </div>
  );
}
