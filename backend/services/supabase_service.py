from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY, validate_env

validate_env()

def get_client():
    return create_client(SUPABASE_URL, SUPABASE_KEY)