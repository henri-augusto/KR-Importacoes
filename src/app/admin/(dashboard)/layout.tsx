import { AdminNav } from "@/components/admin/AdminNav";
import { ErrorState } from "@/components/layout/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { getAdminSession } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shouldCheckRole = isSupabaseConfigured();
  const { isAdmin } = shouldCheckRole
    ? await getAdminSession()
    : { isAdmin: true };

  return (
    <div className="min-h-[100dvh] bg-zinc-50">
      <PageContainer className="py-6 md:py-10">
        <div className="mb-8 border-b border-zinc-200 pb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Painel
          </p>
          <h1 className="mt-1 text-xl font-semibold text-zinc-900 md:text-2xl">
            KR Serviços e Importações
          </h1>
          <div className="mt-6">
            <AdminNav />
          </div>
        </div>
        {isAdmin ? (
          children
        ) : (
          <ErrorState
            statusCode="401"
            eyebrow="Acesso negado"
            title="Você não tem permissão para acessar o painel"
            description="Entre com uma conta administradora para gerenciar produtos e pedidos."
            primaryAction={{ href: "/admin/login", label: "Entrar novamente" }}
            secondaryAction={{ href: "/", label: "Voltar ao site" }}
          />
        )}
      </PageContainer>
    </div>
  );
}
