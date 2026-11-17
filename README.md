# Kroma — Catálogo & Gestão de Produtos de Áudio e Hardware

Aplicação web **Full Stack** desenvolvida como Projeto Prático utilizando Inteligência Artificial como copiloto na arquitetura, implementação e revisão do código.

---

## 1. Integrantes do Grupo e Tema Escolhido

- **Tema escolhido:** Loja e Catálogo de Equipamentos de Áudio Profissional e Hardware (**Kroma Audio & Hardware**)
- **Integrantes do grupo:**
  - Gabriel Oliveira

---

## 2. Stack Tecnológica

- **Frontend:** React 19 + TypeScript + Vite + React Router DOM + Tailwind CSS
- **Backend:** Node.js + Express (`server.ts`) com CORS configurável e porta dinâmica (`process.env.PORT`)
- **Autenticação:** Validação de e-mail e senha no backend com hash `scrypt` + token assinado HMAC-SHA256 (`Authorization: Bearer <token>`)
- **Banco de Dados (NoSQL):** MongoDB (MongoDB Atlas via driver oficial `mongodb` quando `MONGODB_URI` está configurada) com fallback automático para armazenamento NoSQL local em JSON (`data/database.json`) em ambiente de desenvolvimento.

---

## 3. Funcionalidades Implementadas

1. **Autenticação de Usuários (`/login` e `/cadastro`):**
   - Tela de login com e-mail e senha e tela de cadastro de novo usuário.
   - Validação de credenciais e criação de usuários diretamente no backend Express (`POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`).
   - Redirecionamento automático para a área interna (`/produtos`) apenas quando o token é validado pelo backend.
2. **Cadastro de Produtos (`/produtos/novo`):**
   - Rota protegida acessível apenas após login válido.
   - Campos: Nome do produto, Categoria, Preço (R$), Quantidade em estoque, SKU, Descrição e Imagem (via URL ou upload convertido em Base64 com pré-visualização em tempo real).
3. **Listagem e Gestão de Produtos (`/produtos`):**
   - Exibição dinâmica dos produtos salvos no banco de dados em dois formatos: **Cards** e **Tabela**.
   - Busca por nome/descrição/SKU, filtro por categoria, ordenação por preço/data, edição e exclusão com atualização imediata da interface.

---

## 4. Como Rodar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente (opcional em dev; há fallback automático)
cp .env.example .env

# 3. Iniciar servidor Express + Frontend Vite na porta 3000
npm run dev
```

Conta de demonstração pré-cadastrada para testes rápidos:
- **E-mail:** `admin@kromastudio.com.br`
- **Senha:** `kroma2026`

---

## 5. Guia de Deploy em Produção (MongoDB Atlas + Railway + Vercel)

### A. Banco de Dados (MongoDB Atlas)
1. Crie um cluster gratuito no **MongoDB Atlas**.
2. Em **Network Access**, libere o acesso `0.0.0.0/0` para permitir conexões a partir dos servidores da Railway.
3. Copie a *Connection String* (`MONGODB_URI`).

### B. Backend (Railway)
1. Conecte o repositório do GitHub na **Railway**.
2. Em **Variables**, configure:
   - `MONGODB_URI` = sua string de conexão do MongoDB Atlas
   - `JWT_SECRET` = chave secreta forte e aleatória
   - `CORS_ORIGIN` = URL pública do frontend na Vercel (ex: `https://kroma-catalogo.vercel.app`)
3. O servidor lê automaticamente `process.env.PORT`.
4. Gere o domínio público em **Settings → Networking → Generate Domain**.

### C. Frontend (Vercel)
1. Importe o mesmo repositório na **Vercel**.
2. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = URL pública gerada pela Railway (ex: `https://seu-backend.up.railway.app`)
3. O arquivo `vercel.json` na raiz garante o redirecionamento de todas as rotas do React Router para `/index.html`, evitando erros `404` ao recarregar páginas internas.

---

## 6. Exemplos de 3 Prompts Utilizados no Desenvolvimento

1. **Estrutura da API Express e Camada NoSQL:**
   > *"Crie um backend em Node.js com Express e TypeScript que exponha rotas de autenticação (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`) e CRUD de produtos (`/api/products`), usando porta dinâmica `process.env.PORT`, CORS configurável via variável de ambiente e suporte a MongoDB Atlas com fallback para persistência local em JSON quando `MONGODB_URI` não estiver definida."*
2. **Proteção de Rotas e Validação no Backend:**
   > *"Implemente no backend a verificação de senha com `crypto.scryptSync` e geração de token assinado HMAC-SHA256, além de um middleware `requireAuth` para bloquear qualquer requisição às rotas `/api/products` sem um token válido. No React Router, crie um componente `ProtectedRoute` que valide o token no endpoint `/api/auth/me` antes de liberar o acesso ao painel."*
3. **Upload de Imagem Base64/URL e Pré-visualização em Tempo Real:**
   > *"Desenvolva o formulário de cadastro de produtos permitindo que o usuário escolha entre colar uma URL de imagem ou enviar um arquivo local convertido para Base64 via `FileReader`, exibindo uma pré-visualização em tempo real do card do produto ao lado do formulário antes de enviar o `POST` para a API."*
