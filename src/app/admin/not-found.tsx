import { ErrorState } from "@/components/layout/ErrorState";

export default function AdminNotFound() {
  return (
    <ErrorState
      statusCode="404"
      eyebrow="Registro não encontrado"
      title="Esse item não existe mais"
      description="O produto ou pedido pode ter sido removido, ou o link acessado está incorreto."
      primaryAction={{ href: "/admin/produtos", label: "Ver produtos" }}
      secondaryAction={{ href: "/admin", label: "Voltar ao painel" }}
    />
  );
}
