import {
  Building2,
  Globe,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";

import { MasterSidebar } from "../_components/masterSidebar";
import { MasterTopbar } from "../_components/masterTopbar";

export default function MasterConfiguracoesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MasterSidebar />

      <div className="ml-64">
        <MasterTopbar />

        <main className="min-h-screen p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Configurações
            </h1>

            <p className="mt-1 text-muted-foreground">
              Gerencie os dados do administrador e da plataforma.
            </p>
          </div>

          <div className=" ">
            <div className="space-y-6">
              <section className="rounded-xl border border-border bg-card p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    Perfil do Administrador
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Informações do usuário master responsável pela plataforma.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <InputWithIcon
                    label="Nome"
                    icon={<User size={17} />}
                    defaultValue="Eduardo Martins"
                  />

                  <InputWithIcon
                    label="E-mail"
                    icon={<Mail size={17} />}
                    defaultValue="admin@menuflow.com"
                    type="email"
                  />

                  <InputWithIcon
                    label="Telefone"
                    icon={<Phone size={17} />}
                    defaultValue="(99) 99999-9999"
                  />
                </div>

                <div className="mt-6">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                    <Save size={17} />
                    Salvar alterações
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    Dados da Plataforma
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Informações gerais do SaaS exibidas no sistema.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  

                  <InputWithIcon
                    label="E-mail de suporte"
                    icon={<Mail size={17} />}
                    defaultValue="suporte@menuflow.com"
                    type="email"
                  />

                  <InputWithIcon
                    label="WhatsApp de suporte"
                    icon={<Phone size={17} />}
                    defaultValue="(99) 99999-9999"
                  />
                </div>

                <div className="mt-6">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                    <Save size={17} />
                    Salvar dados da plataforma
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    Segurança
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Atualize a senha do administrador master.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <PasswordInput label="Senha atual" placeholder="Digite sua senha atual" />
                  <PasswordInput label="Nova senha" placeholder="Digite a nova senha" />
                  <PasswordInput
                    label="Confirmar nova senha"
                    placeholder="Confirme a nova senha"
                  />
                </div>

                <div className="mt-6">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                    <KeyRound size={17} />
                    Atualizar senha
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-card p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    Redefinir Senha
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Envie um link de redefinição para o e-mail do administrador.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">
                    E-mail atual
                  </p>

                  <p className="mt-1 font-medium text-foreground">
                    admin@menuflow.com
                  </p>
                </div>

                <div className="mt-5">
                  <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
                    <KeyRound size={17} />
                    Enviar link de redefinição
                  </button>
                </div>
              </section>
            </div>

            
          </div>
        </main>
      </div>
    </div>
  );
}

function InputWithIcon({
  label,
  icon,
  defaultValue,
  type = "text",
}: {
  label: string;
  icon: React.ReactNode;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>

        <input
          type={type}
          defaultValue={defaultValue}
          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

function PasswordInput({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>

      <input
        type="password"
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}