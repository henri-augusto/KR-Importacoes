"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/layout/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro inesperado na aplicação:", error);
  }, [error]);

  return (
    <ErrorState
      statusCode="500"
      eyebrow="Erro inesperado"
      title="Não conseguimos carregar esta tela"
      description="Algo saiu do esperado, mas você pode tentar novamente sem perder a navegação do site."
      onRetry={reset}
      secondaryAction={{ href: "/", label: "Voltar ao início" }}
    />
  );
}
