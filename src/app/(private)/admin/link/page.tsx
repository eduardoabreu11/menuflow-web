"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

import { Copy, Download, ExternalLink, MessageCircle } from "lucide-react";

import AdminSidebar from "../_components/adminSidebar";

import { Button } from "@/components/ui/button";

import {
  getSelectedRestaurant,
  type Restaurant,
} from "@/services/restaurantService";

export default function LinkPage() {
  const router = useRouter();

  const qrCodeRef = useRef<HTMLDivElement | null>(null);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const selectedRestaurant = getSelectedRestaurant();

    if (!selectedRestaurant) {
      router.push("/admin/restaurantes/selecionar");
      return;
    }

    queueMicrotask(() => {
      setRestaurant(selectedRestaurant);
    });
  }, [router]);

  const cardapioLink = useMemo(() => {
    if (!restaurant) return "";

    if (typeof window === "undefined") {
      return `/cardapio/${restaurant.slug}`;
    }

    return `${window.location.origin}/cardapio/${restaurant.slug}`;
  }, [restaurant]);

  async function handleCopy() {
    if (!cardapioLink) return;

    await navigator.clipboard.writeText(cardapioLink);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function handleOpen() {
    if (!cardapioLink) return;

    window.open(cardapioLink, "_blank");
  }

  function handleWhatsApp() {
    if (!cardapioLink) return;

    const text = encodeURIComponent(`Confira nosso cardápio: ${cardapioLink}`);

    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function getSvgElement() {
    if (!qrCodeRef.current) return null;

    return qrCodeRef.current.querySelector("svg");
  }

  function handleDownloadSvg() {
    const svg = getSvgElement();

    if (!svg || !restaurant) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `qrcode-${restaurant.slug}.svg`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function handleDownloadPng() {
    const svg = getSvgElement();

    if (!svg || !restaurant) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(svgBlob);

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = 600;
      canvas.height = 600;

      const context = canvas.getContext("2d");

      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 40, 40, 520, 520);

      const pngUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `qrcode-${restaurant.slug}.png`;
      link.click();

      URL.revokeObjectURL(url);
    };

    image.src = url;
  }

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-background">
        <AdminSidebar />

        <section className="ml-64 min-h-screen p-8">
          <h1 className="text-3xl font-bold text-foreground">
            Link & QR Code
          </h1>

          <p className="mt-2 text-muted-foreground">
            Carregando restaurante...
          </p>
        </section>
      </main>
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

        {restaurant.status === "BLOCKED" && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
            Este restaurante está bloqueado. O link ainda pode ser visualizado
            aqui, mas o restaurante não poderá fazer alterações no cardápio.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 text-xl font-semibold text-card-foreground">
              Link do cardápio
            </h2>

            <p className="mb-6 text-sm text-muted-foreground">
              Compartilhe este link para seus clientes acessarem o cardápio.
            </p>

            <div className="break-all rounded-xl border border-border bg-background p-4 text-sm text-foreground">
              {cardapioLink}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleCopy}>
                <Copy size={16} />
                {copied ? "Copiado!" : "Copiar Link"}
              </Button>

              <Button variant="outline" onClick={handleOpen}>
                <ExternalLink size={16} />
                Abrir Cardápio
              </Button>

              <Button variant="outline" onClick={handleWhatsApp}>
                <MessageCircle size={16} />
                WhatsApp
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 text-xl font-semibold text-card-foreground">
              QR Code
            </h2>

            <p className="mb-6 text-sm text-muted-foreground">
              Escaneie para acessar o cardápio.
            </p>

            <div className="flex justify-center">
              <div ref={qrCodeRef} className="rounded-xl bg-white p-4">
                <QRCode value={cardapioLink} size={220} />
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={handleDownloadPng}>
                <Download size={16} />
                PNG
              </Button>

              <Button variant="outline" onClick={handleDownloadSvg}>
                <Download size={16} />
                SVG
              </Button>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-background p-5">
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
          <h3 className="font-semibold text-emerald-500">Cardápio ativo</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Qualquer alteração feita no cardápio será refletida automaticamente
            no link e QR Code.
          </p>
        </div>
      </section>
    </main>
  );
}