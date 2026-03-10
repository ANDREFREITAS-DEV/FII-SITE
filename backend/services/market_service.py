import os
import requests

BRAPI_TOKEN = (os.getenv("BRAPI_TOKEN") or "").strip()

def get_quote(ticker: str) -> dict | None:
    """
    Retorna um dict com dados principais do ativo via BRAPI.
    Espera tickers no formato 'PETR4' / 'HGLG11'. A BRAPI entende sem '.SA' normalmente.
    """
    ticker = ticker.strip().upper()
    if not ticker:
        return None

    token_qs = f"&token={BRAPI_TOKEN}" if BRAPI_TOKEN else ""
    url = f"https://brapi.dev/api/quote/{ticker}?range=1d&interval=1d{token_qs}"

    r = requests.get(url, timeout=15)
    r.raise_for_status()
    data = r.json()

    results = data.get("results") or []
    if not results:
        return None

    item = results[0]
    return {
        "ticker": ticker,
        "name": item.get("shortName") or item.get("longName"),
        "price": item.get("regularMarketPrice"),
        "change_percent": item.get("regularMarketChangePercent"),
        "currency": item.get("currency"),
        "market_time": item.get("regularMarketTime"),
    }
