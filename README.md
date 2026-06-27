# MenuFlow Web

Frontend do **MenuFlow**, um SaaS de cardápio digital para restaurantes, desenvolvido com **Next.js**, **React**, **TypeScript** e **Tailwind CSS**.

O projeto possui três áreas principais:

* Cardápio público acessado pelos clientes do restaurante.
* Painel administrativo do restaurante.
* Painel master da plataforma.

> Projeto em desenvolvimento ativo. Algumas funcionalidades ainda estão em construção e serão integradas progressivamente com a API.

---

## Visão geral

O **MenuFlow Web** é a interface visual da plataforma MenuFlow.

Ele se conecta à API backend `menuflow-api`, responsável por autenticação, restaurantes, categorias, produtos, banners, planos, dashboard e demais regras de negócio.

Repositório da API:

```txt
https://github.com/eduardoabreu11/menuflow-api
```

---

## Objetivo do projeto

O objetivo do MenuFlow é oferecer uma solução simples e profissional para restaurantes criarem e gerenciarem seus cardápios digitais.

A plataforma foi planejada para funcionar como um SaaS com:

```txt
- Cardápio público por restaurante
- Painel do restaurante
- Painel master
- Controle de planos
- Controle financeiro
- Gerenciamento de categorias
- Gerenciamento de produtos
- Gerenciamento de banners
- Link público do cardápio
- Futuramente upload de imagens e vídeos
```

---

## Stack utilizada

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Radix UI
* Lucide React
* Next Image
* App Router

### Integração

* API REST
* JWT
* LocalStorage para persistência inicial de autenticação
* Services centralizados para comunicação com o backend

---

## Estrutura principal do projeto

```txt
src/
├── app/
│   ├── admin/
│   ├── cardapio/
│   ├── master/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── CategoryTable.tsx
│   ├── ProductTable.tsx
│   └── ConfirmDialog.tsx
│
├── lib/
│   └── utils.ts
│
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── bannerService.ts
│   ├── categoryService.ts
│   ├── dashboardService.ts
│   ├── productService.ts
│   └── restaurantService.ts
│
└── styles/
    └── globals.css
```

---

## Áreas do sistema

## 1. Cardápio público

Rota principal:

```txt
/cardapio/[slug]
```

Essa área é acessada pelos clientes finais do restaurante.

Exemplo:

```txt
/cardapio/casa-do-arroz
```

### Componentes principais

```txt
src/app/cardapio/_components/
├── banner.tsx
├── categoryTabs.tsx
├── header.tsx
├── productCard.tsx
├── productSection.tsx
├── restaurantInfo.tsx
└── sideBar.tsx
```

### Funcionalidades previstas

* Exibir dados do restaurante.
* Exibir logo.
* Exibir banners.
* Exibir categorias.
* Exibir produtos por categoria.
* Exibir preço, descrição, imagem e destaque.
* Interface responsiva.
* Integração com rota pública da API:

```txt
GET /public/menu/:slug
```

### Status atual

```txt
- Estrutura visual criada
- Componentes principais criados
- Layout inicial criado
- Integração com API em andamento
```

---

## 2. Painel administrativo do restaurante

Rota principal:

```txt
/admin
```

Área utilizada pelo dono do restaurante para gerenciar seu cardápio.

### Rotas existentes

```txt
/admin/login
/admin
/admin/cardapio
/admin/categorias
/admin/produtos
/admin/link
/admin/configuracoes
/admin/assinatura
/admin/restaurantes/novo
/admin/restaurantes/selecionar
```

---

### Dashboard do restaurante

Rota:

```txt
/admin
```

Funcionalidades previstas:

* Exibir total de categorias.
* Exibir total de produtos.
* Exibir produtos ativos.
* Exibir progresso de configuração.
* Exibir produtos recentes.

Integração planejada:

```txt
GET /dashboard?restaurant_id=
GET /dashboard/recent-products?restaurant_id=
```

---

### Categorias

Rota:

```txt
/admin/categorias
```

Funcionalidades:

* Listar categorias.
* Criar categoria.
* Editar categoria.
* Ativar/desativar categoria.
* Excluir categoria.
* Exibir emoji, nome, status e ações.

Integração com API:

```txt
GET /categories?restaurant_id=
POST /categories
PATCH /categories/:id
PATCH /categories/:id/activate
PATCH /categories/:id/disable
DELETE /categories/:id
```

---

### Produtos

Rota:

```txt
/admin/produtos
```

Funcionalidades:

* Listar produtos.
* Criar produto.
* Editar produto.
* Ativar/desativar produto.
* Excluir produto.
* Informar nome.
* Informar descrição.
* Informar preço.
* Selecionar categoria.
* Marcar como promoção.
* Marcar como lançamento.
* Adicionar imagem.
* Futuramente adicionar vídeo.

Integração com API:

```txt
GET /products?restaurant_id=
GET /products?restaurant_id=&category_id=
POST /products
PATCH /products/:id
PATCH /products/:id/activate
PATCH /products/:id/disable
DELETE /products/:id
```

---

### Cardápio/configurações do restaurante

Rota:

```txt
/admin/cardapio
```

Funcionalidades previstas:

* Editar nome do restaurante.
* Editar descrição.
* Editar logo.
* Editar contato.
* Editar WhatsApp.
* Editar telefone.
* Editar endereço.
* Editar horário de funcionamento.
* Gerenciar banners.

Integração com API:

```txt
GET /restaurants/:id
PATCH /restaurants/:id
GET /banners?restaurant_id=
POST /banners
PATCH /banners/:id
PATCH /banners/:id/activate
PATCH /banners/:id/disable
DELETE /banners/:id
```

---

### Link e QR Code

Rota:

```txt
/admin/link
```

Funcionalidades previstas:

* Exibir link público do cardápio.
* Copiar link.
* Compartilhar link.
* Futuramente gerar QR Code.

Exemplo de link:

```txt
/cardapio/casa-do-arroz
```

---

### Configurações

Rota:

```txt
/admin/configuracoes
```

Funcionalidades previstas:

* Dados da conta.
* Alterar e-mail.
* Alterar senha.
* Encerrar sessão.
* Configurações de segurança.

---

### Assinatura

Rota:

```txt
/admin/assinatura
```

Funcionalidades previstas:

* Exibir plano atual.
* Exibir status da assinatura.
* Exibir data de vencimento.
* Exibir data de renovação.
* Futuramente integrar com financeiro da API.

---

## 3. Painel master

Rota principal:

```txt
/master
```

Área administrativa geral da plataforma.

Usada pelo administrador do MenuFlow para acompanhar restaurantes, planos e financeiro.

### Rotas existentes

```txt
/master
/master/restaurantes
/master/restaurantes/[id]
/master/planos
/master/financeiro
/master/configuracoes
```

---

### Dashboard master

Rota:

```txt
/master
```

Funcionalidades previstas:

* Total de restaurantes.
* Restaurantes ativos.
* Restaurantes bloqueados.
* Planos ativos.
* Restaurantes recentes.

---

### Restaurantes

Rota:

```txt
/master/restaurantes
```

Funcionalidades previstas:

* Listar restaurantes.
* Buscar restaurante.
* Ver detalhes.
* Bloquear restaurante.
* Ativar restaurante.
* Visualizar status.
* Visualizar plano.
* Visualizar data de cadastro.

Integração com API:

```txt
GET /restaurants
GET /restaurants/:id
PATCH /restaurants/:id/block
PATCH /restaurants/:id/activate
```

---

### Detalhes do restaurante

Rota:

```txt
/master/restaurantes/[id]
```

Funcionalidades previstas:

* Exibir dados completos do restaurante.
* Exibir status.
* Exibir plano.
* Exibir informações do responsável.
* Futuramente exibir pagamentos e assinatura.

---

### Planos

Rota:

```txt
/master/planos
```

Funcionalidades previstas:

* Listar planos.
* Criar plano.
* Editar plano.
* Desativar plano.
* Excluir plano.

Integração com API:

```txt
GET /plans
GET /plans/:id
POST /plans
PATCH /plans/:id
PATCH /plans/:id/disable
DELETE /plans/:id
```

Observação atual:

O MVP do MenuFlow será iniciado com **um plano único completo**. Os campos de limites ficam preparados para evolução futura, mas não são prioridade nesta fase.

---

### Financeiro

Rota:

```txt
/master/financeiro
```

Funcionalidades previstas:

* Exibir resumo financeiro.
* Exibir faturas.
* Exibir status de pagamento.
* Exibir pagamentos pagos, pendentes e atrasados.
* Futuramente integrar com assinaturas.

Status planejados:

```txt
PAID
PENDING
OVERDUE
CANCELED
```

---

### Configurações master

Rota:

```txt
/master/configuracoes
```

Funcionalidades previstas:

* Dados do administrador.
* Configurações da plataforma.
* Segurança.
* Futuramente usuários master.

---

## Services

A comunicação com a API foi separada em arquivos dentro de:

```txt
src/services/
```

### api.ts

Arquivo responsável por centralizar a URL base da API.

```ts
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3333";
```

---

### authService.ts

Responsável por autenticação.

Funcionalidades previstas/implementadas:

```txt
- Login
- Salvar token
- Salvar usuário
- Buscar token
- Buscar usuário
- Encerrar sessão
```

---

### categoryService.ts

Responsável por chamadas relacionadas a categorias.

```txt
GET /categories
POST /categories
PATCH /categories/:id
DELETE /categories/:id
```

---

### productService.ts

Responsável por chamadas relacionadas a produtos.

```txt
GET /products
POST /products
PATCH /products/:id
DELETE /products/:id
```

---

### bannerService.ts

Responsável por chamadas relacionadas a banners.

```txt
GET /banners
POST /banners
PATCH /banners/:id
DELETE /banners/:id
```

---

### dashboardService.ts

Responsável por chamadas relacionadas ao dashboard do restaurante.

```txt
GET /dashboard
GET /dashboard/recent-products
```

---

### restaurantService.ts

Responsável por chamadas relacionadas a restaurantes.

```txt
GET /restaurants
GET /restaurants/:id
POST /restaurants
PATCH /restaurants/:id
```

---

## Variáveis de ambiente

Crie um arquivo `.env` ou `.env.local` na raiz do projeto.

Exemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Também existe um `.env.example` como modelo seguro para o GitHub.

### Importante

O arquivo `.env` real não deve ser enviado ao GitHub.

O projeto deve manter no GitHub apenas:

```txt
.env.example
```

E não deve subir:

```txt
.env
.env.local
node_modules
.next
```

---

## Como rodar localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/eduardoabreu11/menuflow-web.git
```

### 2. Entrar na pasta

```bash
cd menuflow-web
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Criar arquivo de ambiente

Crie um arquivo `.env` ou `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

### 5. Rodar o backend

Antes de rodar o frontend, a API precisa estar rodando.

Repositório do backend:

```txt
https://github.com/eduardoabreu11/menuflow-api
```

API local esperada:

```txt
http://localhost:3333
```

### 6. Rodar o frontend

```bash
npm run dev
```

O frontend ficará disponível em:

```txt
http://localhost:3000
```

---

## Scripts principais

```bash
npm run dev
```

Executa o projeto em ambiente de desenvolvimento.

```bash
npm run build
```

Gera a versão de produção.

```bash
npm run start
```

Executa a versão de produção após o build.

```bash
npm run lint
```

Executa a verificação de lint, caso configurada no projeto.

---

## Status atual do frontend

### Já feito

```txt
- Estrutura inicial com Next.js
- App Router
- Layout global
- Tailwind configurado
- shadcn/ui configurado
- Componentes UI criados
- Painel admin iniciado
- Painel master iniciado
- Cardápio público iniciado
- Services criados para comunicação com API
- .env.example criado
- Repositório versionado no GitHub
```

---

### Em andamento

```txt
- Integração real das telas com a API
- Ajustes de autenticação
- Proteção de rotas
- Substituição de dados mockados por dados reais
- Melhorias visuais
- Ajustes responsivos
```

---

### Pendente

```txt
- Login real completamente integrado
- Persistência segura do usuário logado
- Middleware/proteção de rotas no frontend
- Dashboard admin com dados reais
- Categorias com API real em todas as ações
- Produtos com API real em todas as ações
- Banners com API real em todas as ações
- Configurações do restaurante com API real
- Painel master com API real
- Financeiro real
- Assinatura real
- Upload de imagens
- Upload de vídeos
- QR Code real
- Estados de loading
- Estados vazios
- Tratamento de erros de API
- Toasts/feedback visual
- Testes
- Deploy
```

---

## Roadmap do frontend

### Fase 1 — Estrutura inicial

```txt
Concluído:
- Criar projeto Next.js
- Criar estrutura de páginas
- Criar painel admin
- Criar painel master
- Criar cardápio público
- Criar services
- Configurar .env.example
- Subir para o GitHub
```

---

### Fase 2 — Integração com API

```txt
Em andamento:
- Login
- Dashboard admin
- Categorias
- Produtos
- Banners
- Restaurantes
- Planos
```

---

### Fase 3 — Segurança no frontend

```txt
Planejado:
- Proteger rotas privadas
- Redirecionar usuário não logado
- Separar acesso MASTER e RESTAURANT_OWNER
- Tratar token expirado
- Criar logout completo
```

---

### Fase 4 — Experiência do usuário

```txt
Planejado:
- Melhorar loading
- Melhorar mensagens de erro
- Melhorar estados vazios
- Criar feedback visual para ações
- Criar confirmação antes de exclusão
- Melhorar responsividade
```

---

### Fase 5 — Upload e mídia

```txt
Planejado:
- Upload de logo
- Upload de banner
- Upload de imagem de produto
- Upload de vídeo de produto
- Validação de tipo de arquivo
- Validação de tamanho do arquivo
```

---

### Fase 6 — Deploy

```txt
Planejado:
- Build de produção
- Deploy do frontend
- Configuração da URL da API em produção
- Integração com backend em produção
```

Possibilidades futuras:

```txt
Vercel
Hostinger
VPS
```

---

## Relação com o backend

Este frontend depende do backend `menuflow-api`.

Backend local esperado:

```txt
http://localhost:3333
```

Variável usada no frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Rota pública principal consumida pelo cardápio:

```txt
GET /public/menu/:slug
```

Rotas privadas consumidas pelos painéis:

```txt
/login
/restaurants
/categories
/products
/banners
/dashboard
/plans
/users
```

---

## Git e versionamento

Fluxo básico usado no projeto:

```bash
git status
git add .
git commit -m "mensagem do commit"
git push
```

Exemplo:

```bash
git add .
git commit -m "docs: adiciona README completo do frontend MenuFlow"
git push
```

---

## Repositórios

Frontend:

```txt
https://github.com/eduardoabreu11/menuflow-web
```

Backend:

```txt
https://github.com/eduardoabreu11/menuflow-api
```

---

## Observação

Este projeto ainda está em desenvolvimento.

O foco atual é transformar a estrutura visual já criada em um sistema totalmente integrado com a API real.

Prioridades atuais:

```txt
- Documentação inicial
- Testes básicos no backend
- Integração real do frontend com a API
- Proteção de rotas
- Painel admin funcional
- Painel master funcional
- Cardápio público funcional
```

Futuramente, o projeto será preparado para Docker, deploy, upload de mídia e uso real por restaurantes.
