from services.supabase_service import get_client
from services.brapi_service import get_dividends

def update_dividends_for_ticker(ticker):

    sb = get_client()

    dividends = get_dividends(ticker)

    for d in dividends:

        sb.table("dividendos").upsert({
            "ticker": ticker,
            "data_pagamento": d.get("paymentDate"),
            "valor_por_cota": d.get("value")
        }).execute()