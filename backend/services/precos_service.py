import requests
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def atualizar_precos():

    res = supabase.table("wallet").select("ticker").execute()

    tickers = list(set([item["ticker"] for item in res.data]))

    if not tickers:
        return

    url = f"https://brapi.dev/api/quote/{','.join(tickers)}"

    response = requests.get(url)
    data = response.json()["results"]

    for ativo in data:

        supabase.table("precos_ativos").upsert({
            "ticker": ativo["symbol"],
            "nome": ativo.get("longName"),
            "preco": ativo.get("regularMarketPrice"),
            "variacao": ativo.get("regularMarketChangePercent")
        }).execute()