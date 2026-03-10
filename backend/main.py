import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime, timezone

from config import ALLOWED_ORIGINS

from services.supabase_service import get_client
from scheduler import start_scheduler, update_wallet_prices

def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def consolidate_wallet_items(rows: list[dict]) -> list[dict]:
    """
    Consolida compras repetidas (mesmo ticker) APENAS para exibição.
    Mantém registros separados no banco.
    """
    groups: dict[str, list[dict]] = {}
    for r in rows:
        t = (r.get("ticker") or "").strip().upper()
        if not t:
            continue
        groups.setdefault(t, []).append(r)

    out: list[dict] = []
    for t, items in sorted(groups.items(), key=lambda kv: kv[0]):
        total_qtd = 0.0
        total_investido = 0.0

        def _ts(x):
            return x.get("updated_at") or ""
        latest = sorted(items, key=_ts, reverse=True)[0]

        preco_atual = latest.get("preco_atual")
        try:
            preco_atual = float(preco_atual) if preco_atual is not None else None
        except Exception:
            preco_atual = None

        for it in items:
            qtd = float(it.get("quantidade") or 0)
            pm = float(it.get("preco_medio") or 0)
            total_qtd += qtd
            total_investido += qtd * pm

        preco_medio_pond = (total_investido / total_qtd) if total_qtd > 0 else 0.0
        valor_atual = (total_qtd * preco_atual) if (preco_atual is not None) else None
        pnl = (valor_atual - total_investido) if (valor_atual is not None) else None
        pnl_pct = ((pnl / total_investido) * 100) if (pnl is not None and total_investido > 0) else None

        out.append({
            "ticker": t,
            "nome": latest.get("nome") or latest.get("name") or t,
            "quantidade": total_qtd,
            "preco_medio": preco_medio_pond,
            "preco_atual": preco_atual,
            "variacao_pct": latest.get("variacao_pct"),
            "investido": total_investido,
            "valor_atual": valor_atual,
            "pnl": pnl,
            "pnl_pct": pnl_pct,
            "updated_at": latest.get("updated_at"),
        })
    return out

ALLOWED_ORIGINS = (os.getenv("ALLOWED_ORIGINS") or "http://localhost:5173").split(",")

app = FastAPI(title="Carteira API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# inicia job em background ao subir o app
_scheduler = None

@app.on_event("startup")
def _startup():
    global _scheduler
    _scheduler = start_scheduler()

class WalletItemCreate(BaseModel):
    ticker: str = Field(..., examples=["HGLG11"])
    quantidade: float = Field(..., ge=0)
    preco_medio: float = Field(..., ge=0)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/wallet")
def list_wallet():
    sb = get_client()
    rows = sb.table("wallet").select("*").order("ticker").execute().data or []
    consolidated = consolidate_wallet_items(rows)
    
    last_update = None
    if consolidated:
        valid_dates = [c.get("updated_at") for c in consolidated if c.get("updated_at")]
        if valid_dates:
            last_update = max(valid_dates)

    return {
        "items": consolidated,
        "raw_count": len(rows),
        "tickers": len(consolidated),
        "last_update": last_update
    }
    
@app.post("/wallet")
def add_wallet_item(payload: WalletItemCreate):
    sb = get_client()
    row = {
        "ticker": payload.ticker.strip().upper(),
        "quantidade": float(payload.quantidade),
        "preco_medio": float(payload.preco_medio),
        "preco_atual": None,
        "updated_at": utc_now_iso(),
    }
    created = sb.table("wallet").insert(row).execute().data
    return {"created": created}

@app.delete("/wallet/{item_id}")
def delete_wallet_item(item_id: str):
    sb = get_client()
    sb.table("wallet").delete().eq("id", item_id).execute()
    return {"deleted": True}

@app.delete("/wallet/ticker/{ticker}")
def delete_wallet_by_ticker(ticker: str):
    sb = get_client()
    t = (ticker or "").strip().upper()
    sb.table("wallet").delete().eq("ticker", t).execute()
    return {"deleted": True, "ticker": t}

@app.post("/update")
def manual_update():
    # Atualização manual on-demand
    update_wallet_prices()
    return {"updated": True, "at": utc_now_iso()}

@app.get("/history")
def get_history():
    sb = get_client()
    res = sb.table("wallet_history").select("*").order("data").execute()
    return {"history": res.data}


@app.get("/dividends")
def get_dividends_summary():

    sb = get_client()

    wallet = sb.table("wallet").select("ticker, quantidade, preco_medio, preco_atual").execute().data or []
    divs = sb.table("dividendos").select("ticker, valor_por_cota").execute().data or []

    # mapa de dividendos por ticker
    div_map = {}

    for d in divs:
        ticker = d["ticker"].upper()
        valor = float(d["valor_por_cota"])
        div_map[ticker] = valor

    dividendos_total = 0
    valor_carteira = 0

    dividendos_por_ativo = []

    for w in wallet:

        ticker = w["ticker"].upper()
        qtd = float(w["quantidade"])

        preco = w.get("preco_atual") or w["preco_medio"]
        preco = float(preco)

        valor_carteira += qtd * preco

        valor_por_cota = div_map.get(ticker, 0)

        renda = qtd * valor_por_cota

        dividendos_total += renda

        dividendos_por_ativo.append({
            "ticker": ticker,
            "quantidade": qtd,
            "dividendo_por_cota": valor_por_cota,
            "renda_mensal": renda
        })

    yield_mensal = 0
    yield_anual = 0

    if valor_carteira > 0:
        yield_mensal = (dividendos_total / valor_carteira) * 100
        yield_anual = yield_mensal * 12

    return {

        "dividendos_mensais": dividendos_total,
        "dividendos_ano": dividendos_total * 12,
        "valor_carteira": valor_carteira,
        "yield_mensal": yield_mensal,
        "yield_anual": yield_anual,
        "por_ativo": dividendos_por_ativo

    }

@app.get("/dividends/monthly")
def dividends_monthly():

    # dados mock por enquanto
    return {
        "months": [
            {"mes": "Jan", "valor": 82},
            {"mes": "Fev", "valor": 90},
            {"mes": "Mar", "valor": 97},
            {"mes": "Abr", "valor": 104}
        ]
    }