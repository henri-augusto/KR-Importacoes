# KR Servicos e Importacoes

E-commerce de perfumes importados em Next.js, com catalogo publico, compra via WhatsApp e painel administrativo.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth)

## Comecar

1. Instale dependencias:

```bash
npm install
```

2. Copie as variaveis de ambiente:

```bash
cp .env.example .env.local
```

3. No [Supabase](https://supabase.com), crie um projeto e execute o SQL em `supabase/schema.sql` no SQL Editor.

4. Crie um usuario admin em Authentication e insira o perfil:

```sql
insert into public.admin_profiles (id, full_name, role)
values ('UUID-DO-USUARIO-AUTH', 'Administrador', 'admin');
```

5. Rode o projeto:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Rotas

| Rota | Descricao |
|------|-----------|
| `/` | Landing page |
| `/catalogo` | Listagem de perfumes |
| `/catalogo/[slug]` | Detalhe e checkout WhatsApp |
| `/admin/login` | Login administrativo |
| `/admin` | Dashboard |
| `/admin/produtos` | Gestao de produtos |
| `/admin/pedidos` | Gestao de pedidos |

## Compra via WhatsApp

O cliente escolhe o produto, informa nome e telefone (sem cadastro). O pedido e salvo no Supabase e o WhatsApp abre com a mensagem formatada.

Sem Supabase configurado, o site usa produtos de demonstracao e ainda abre o WhatsApp (sem persistir pedidos).

## Mobile first

Layouts pensados primeiro para celular (320–428px), com expansao progressiva em `md:` e `lg:`.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de producao
- `npm run start` — servidor de producao
- `npm run lint` — ESLint
