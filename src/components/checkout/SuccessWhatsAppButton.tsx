"use client";

import { useEffect, useRef } from "react";

export function SuccessWhatsAppButton({ whatsappUrl }: { whatsappUrl: string }) {
  const opened = useRef(false);

  useEffect(() => {
    if (!whatsappUrl || opened.current) return;
    opened.current = true;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }, [whatsappUrl]);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-base font-medium text-zinc-800"
    >
      Abrir WhatsApp novamente
    </a>
  );
}
