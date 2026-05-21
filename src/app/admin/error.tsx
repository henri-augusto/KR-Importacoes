"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/layout/ErrorState";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro inesperado no painel administrativo:", error);
  }, [error]);

  return (
    <ErrorState
      statusCode="500"
      eyebrow="Erro no painel"
      title="Não foi possível carregar esta área"
      description="A operação não foi concluída. Verifique sua conexão e tente novamente."
      onRetry={reset}
      secondaryAction={{ href: "/admin", label: "Voltar ao painel" }}
    />
  );
}
