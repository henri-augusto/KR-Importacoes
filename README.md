# KR Serviços e Importações

E-commerce de perfumes importados em Next.js, com catálogo público, compra via WhatsApp e painel administrativo.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth)

## Começar

1. Instale dependências:

```bash
npm install
```

2. Copie as variáveis de ambiente:

```bash
cp .env.example .env.local
```

3. No [Supabase](https://supabase.com), crie um projeto e execute o SQL em `supabase/schema.sql` no SQL Editor.

4. Crie um usuário admin em Authentication e insira o perfil:

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

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/catalogo` | Listagem de perfumes |
| `/catalogo/[slug]` | Detalhe e checkout WhatsApp |
| `/admin/login` | Login administrativo |
| `/admin` | Dashboard |
| `/admin/produtos` | Gestão de produtos |
| `/admin/pedidos` | Gestão de pedidos |

## Compra via WhatsApp

O cliente escolhe o produto, informa nome e telefone (sem cadastro). O pedido é salvo no Supabase e o WhatsApp abre com a mensagem formatada.

Sem Supabase configurado, o site usa produtos de demonstração e ainda abre o WhatsApp (sem persistir pedidos).

## Mobile first

Layouts pensados primeiro para celular (320–428px), com expansão progressiva em `md:` e `lg:`.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run start` — servidor de produção
- `npm run lint` — ESLint
