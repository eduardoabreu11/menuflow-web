import { Bell, ChevronDown } from "lucide-react";

export function MasterTopbar() {
  return (
    <header className="flex h-20 items-center justify-end border-b border-border bg-background px-8">
      

      <div className="flex items-center gap-6">
        <button className="relative text-muted-foreground transition-colors hover:text-foreground">
          <Bell size={20} />

          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            A
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">
              Admin
            </p>

            <p className="text-xs text-muted-foreground">
              Administrador
            </p>
          </div>

          <ChevronDown
            size={16}
            className="text-muted-foreground"
          />
        </div>
      </div>
    </header>
  );
}