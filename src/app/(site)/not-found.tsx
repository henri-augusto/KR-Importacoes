import { ErrorState } from "@/components/layout/ErrorState";

export default function SiteNotFound() {
  return (
    <ErrorState
      statusCode="404"
      eyebrow="Não encontrado"
      title="Produto ou página indisponível"
      description="Esse item pode ter saído do catálogo. Continue navegando para encontrar outras opções disponíveis."
      primaryAction={{ href: "/catalogo", label: "Ver catálogo" }}
      secondaryAction={{ href: "/", label: "Voltar ao início" }}
    />
  );
}
