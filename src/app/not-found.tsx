import { ErrorState } from "@/components/layout/ErrorState";

export default function NotFound() {
  return (
    <ErrorState
      statusCode="404"
      eyebrow="Página não encontrada"
      title="Não encontramos esse endereço"
      description="O link pode ter mudado ou o conteúdo não está mais disponível."
      primaryAction={{ href: "/catalogo", label: "Ver catálogo" }}
      secondaryAction={{ href: "/", label: "Voltar ao início" }}
    />
  );
}
