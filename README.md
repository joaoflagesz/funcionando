# Painel de Vendas de Sites

Projeto pronto para subir na Vercel com banco no Supabase.

## 1. Instalar

```bash
npm install
```

## 2. Configurar variáveis

Copie `.env.example` para `.env` e preencha:

```bash
cp .env.example .env
```

## 3. Rodar local

```bash
npm run dev
```

## 4. Supabase

- Crie um projeto no Supabase
- Rode `supabase/schema.sql` no SQL Editor
- Ative login por Email em Authentication
- Pegue `Project URL` e `anon key`

## 5. Vercel

- Suba este projeto para o GitHub
- Importe na Vercel
- Adicione as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Deploy

## 6. Se quiser testar sem Supabase

Sem `.env`, o app entra em modo demo e salva no navegador.
