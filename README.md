# Carteira (React + FastAPI + Supabase + BRAPI)

## 1) Supabase: criar tabela
Crie a tabela `wallet` (schema public) com as colunas:

- id uuid (default gen_random_uuid()) PK
- ticker text not null
- quantidade numeric
- preco_medio numeric
- preco_atual numeric (nullable)
- nome text (nullable)
- moeda text (nullable)
- variacao_pct numeric (nullable)
- updated_at timestamptz

> Dica: ative RLS e crie políticas conforme seu modelo (pessoal/multi-tenant).

## 2) Backend (FastAPI)
```bash
cd backend
cp .env.example .env
# preencha SUPABASE_URL, SUPABASE_KEY e (opcional) BRAPI_TOKEN
pip install -r requirements.txt
uvicorn main:app --reload
```

Endpoints:
- GET /wallet
- POST /wallet
- DELETE /wallet/{id}
- POST /update (força atualização agora)

## 3) Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

Configure a URL do backend em `frontend/.env.example` -> `VITE_API_BASE`.

## 4) Atualização automática
O backend roda um scheduler (APSheduler) que executa a atualização a cada `UPDATE_INTERVAL_MINUTES` (padrão 5).


## Nível 1
- GET /wallet retorna a carteira consolidada por ticker (somando quantidade e calculando preço médio ponderado).
- DELETE /wallet/ticker/{ticker} remove todas as compras daquele ticker.
