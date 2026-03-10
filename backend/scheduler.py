import os
from datetime import datetime, timezone
from apscheduler.schedulers.background import BackgroundScheduler

from services.market_service import get_quote
from services.supabase_service import get_client

UPDATE_INTERVAL_MINUTES = int((os.getenv("UPDATE_INTERVAL_MINUTES") or "5").strip())

def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()

def update_wallet_prices():
    sb = get_client()
    # wallet: id, ticker, quantidade, preco_medio, preco_atual, updated_at
    wallet = sb.table("wallet").select("*").execute().data or []

    # evita chamadas duplicadas para tickers repetidos
    tickers = sorted({(row.get("ticker") or "").strip().upper() for row in wallet if row.get("ticker")})
    quotes = {}

    for t in tickers:
        try:
            q = get_quote(t)
            if q and q.get("price") is not None:
                quotes[t] = q
        except Exception:
            # não derruba o job por 1 ativo com falha
            continue

    for row in wallet:
        t = (row.get("ticker") or "").strip().upper()
        q = quotes.get(t)
        if not q:
            continue

        try:
            sb.table("wallet").update({
                "preco_atual": float(q["price"]),
                "updated_at": utc_now_iso(),
                "nome": q.get("name"),
                "moeda": q.get("currency"),
                "variacao_pct": q.get("change_percent"),
            }).eq("id", row["id"]).execute()
        except Exception:
            continue

def start_scheduler():
    sched = BackgroundScheduler(daemon=True)
    sched.add_job(update_wallet_prices, "interval", minutes=UPDATE_INTERVAL_MINUTES, id="wallet_update", replace_existing=True)
    sched.start()
    return sched

# snapshot diário
from datetime import date

def save_daily_snapshot(sb):
    today = date.today().isoformat()

    existing = sb.table("wallet_history").select("id").eq("data", today).execute()
    if existing.data:
        return

    rows = sb.table("wallet").select("*").execute().data

    investido_total = 0
    valor_total = 0

    for r in rows:
        qtd = float(r.get("quantidade") or 0)
        pm = float(r.get("preco_medio") or 0)
        pa = float(r.get("preco_atual") or 0)

        investido_total += qtd * pm
        valor_total += qtd * pa

    pnl_total = valor_total - investido_total

    sb.table("wallet_history").insert({
        "data": today,
        "valor_total": valor_total,
        "investido_total": investido_total,
        "pnl_total": pnl_total
    }).execute()
