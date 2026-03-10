import requests
from config import BRAPI_TOKEN

BASE_URL = "https://brapi.dev/api/quote"

def get_dividends(ticker):

    url = f"{BASE_URL}/{ticker}"

    params = {}

    if BRAPI_TOKEN:
        params["token"] = BRAPI_TOKEN

    r = requests.get(url, params=params)

    data = r.json()

    if "results" not in data:
        return []

    result = data["results"][0]

    return result.get("dividendsData", [])