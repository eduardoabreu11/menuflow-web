"use client";

import QRCode from "react-qr-code";

import {
  Copy,
  ExternalLink,
  Download,
  MessageCircle,
} from "lucide-react";

import AdminSidebar from "../_components/adminSidebar";

import { Button } from "@/components/ui/button";

export default function LinkPage() {
  const slug = "pizzaria-do-joao";

  const cardapioLink =
    `https://menuflow.com/cardapio/${slug}`;

  function handleCopy() {
    navigator.clipboard.writeText(cardapioLink);
  }

  function handleOpen() {
    window.open(cardapioLink, "_blank");
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Confira nosso cardápio: ${cardapioLink}`
    );

    window.open(
      `https://wa.me/?text=${text}`,
      "_blank"
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <AdminSidebar />

      <section className="ml-64 min-h-screen p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Link & QR Code
          </h1>

          <p className="mt-2 text-muted-foreground">
            Compartilhe seu cardápio com seus clientes.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 text-xl font-semibold">
              Link do cardápio
            </h2>

            <p className="mb-6 text-sm text-muted-foreground">
              Compartilhe este link para seus clientes.
            </p>

            <div className="rounded-xl border border-border bg-background p-4">
              {cardapioLink}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleCopy}>
                <Copy />
                Copiar Link
              </Button>

              <Button
                variant="outline"
                onClick={handleOpen}
              >
                <ExternalLink />
                Abrir Cardápio
              </Button>

              <Button
                variant="outline"
                onClick={handleWhatsApp}
              >
                <MessageCircle />
                WhatsApp
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 text-xl font-semibold">
              QR Code
            </h2>

            <p className="mb-6 text-sm text-muted-foreground">
              Escaneie para acessar o cardápio.
            </p>

            <div className="flex justify-center">
              <div className="rounded-xl bg-white p-4">
                <QRCode
                  value={cardapioLink}
                  size={220}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline">
                <Download />
                PNG
              </Button>

              <Button variant="outline">
                <Download />
                SVG
              </Button>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
  <div className="mb-4 flex items-center gap-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
      💡
    </div>

    <h3 className="font-semibold text-card-foreground">
      Dicas de uso
    </h3>
  </div>

  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
        ✓
      </div>

      <span className="text-sm text-muted-foreground">
        Imprima e coloque nas mesas do seu restaurante
      </span>
    </div>

    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
        ✓
      </div>

      <span className="text-sm text-muted-foreground">
        Adicione o QR Code em materiais de divulgação
      </span>
    </div>

    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
        ✓
      </div>

      <span className="text-sm text-muted-foreground">
        Compartilhe o link nas redes sociais e WhatsApp
      </span>
    </div>
  </div>
</div>
          </div>

          
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <h3 className="font-semibold text-emerald-500">
            Cardápio ativo
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Qualquer alteração feita no cardápio será
            refletida automaticamente no link e QR Code.
          </p>
        </div>
      </section>
    </main>
  );
}