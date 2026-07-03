import {
  FolderOpen,
  ShoppingBag,
  Link as LinkIcon,
  ChevronRight,
} from "lucide-react";

export default function SetupSteps() {
  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-card-foreground">
        Comece aqui
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Siga os passos para ter seu cardápio online em poucos minutos.
      </p>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              1
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-primary">
              <FolderOpen size={26} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground">
              Crie suas categorias
            </h3>

            <p className="mt-1 max-w-[220px] text-sm text-muted-foreground">
              Organize seu cardápio criando categorias.
            </p>

            <button className="mt-4 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Criar categorias
            </button>
          </div>
        </div>

        <ChevronRight size={22} className="text-muted-foreground" />

        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              2
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-primary">
              <ShoppingBag size={26} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground">
              Adicione seus produtos
            </h3>

            <p className="mt-1 max-w-[220px] text-sm text-muted-foreground">
              Adicione fotos, preços e descrições.
            </p>

            <button className="mt-4 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Adicionar produtos
            </button>
          </div>
        </div>

        <ChevronRight size={22} className="text-muted-foreground" />

        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              3
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-primary">
              <LinkIcon size={26} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground">
              Compartilhe o link
            </h3>

            <p className="mt-1 max-w-[220px] text-sm text-muted-foreground">
              Gere o link ou QR Code para seus clientes.
            </p>

            <button className="mt-4 cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Ver link e QR Code
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}