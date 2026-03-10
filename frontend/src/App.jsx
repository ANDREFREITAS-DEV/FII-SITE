import React, { useEffect, useMemo, useState } from "react";

import AllocationChart from "./components/AllocationChart"
import PortfolioChart from "./components/PortfolioChart"
import PortfolioSummary from "./components/PortfolioSummary"
import DividendSummary from "./components/DividendSummary"

import AddAssetForm from "./components/wallet/AddAssetForm"
import WalletTable from "./components/wallet/WalletTable"

import PassiveIncomeChart from "./components/dividends/PassiveIncomeChart"

import { apiDelete, apiGet, apiPost } from "./api.js";
function formatRelativeTime(timestamp) {
  if (!timestamp) return "Nunca atualizado";
  const now = new Date();
  const updated = new Date(timestamp);
  const diffMin = Math.floor((now - updated) / 60000);
  if (diffMin < 1) return "Agora mesmo";
  if (diffMin === 1) return "Há 1 minuto";
  return `Há ${diffMin} minutos`;
}

function statusColor(timestamp) {
  if (!timestamp) return "neg";
  const now = new Date();
  const updated = new Date(timestamp);
  const diffMin = Math.floor((now - updated) / 60000);
  if (diffMin <= 5) return "pos";
  if (diffMin <= 15) return "warn";
  return "neg";
}
function signedBRL(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
  const n = Number(v);
  const sign = n > 0 ? "+" : "";
  return sign + n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatBRL(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
  return `${Number(v).toFixed(2)}%`;
}

export default function App() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [ticker, setTicker] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [precoMedio, setPrecoMedio] = useState("");
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  
  async function loadHistory(){
    const res = await fetch("http://localhost:8000/history");
    const data = await res.json();
    setHistory(data.history || []);
  }

async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await apiGet("/wallet");
      setItems(data.items || []);
      setLastUpdate(data.last_update || null);
    } catch (e) {
      setErr("Não consegui carregar a carteira. Verifique o backend e CORS.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load();
    loadHistory(); }, []);

  const totals = useMemo(() => {
    let investido = 0;
    let atual = 0;

    for (const it of items) {
      const inv = it.investido !== undefined && it.investido !== null ? Number(it.investido) : null;
      const val = it.valor_atual !== undefined && it.valor_atual !== null ? Number(it.valor_atual) : null;

      if (inv !== null && !Number.isNaN(inv)) investido += inv;

      if (val !== null && !Number.isNaN(val)) {
        atual += val;
      } else {
        const qtd = Number(it.quantidade || 0);
        const pm = Number(it.preco_medio || 0);
        const pa = it.preco_atual === null || it.preco_atual === undefined ? null : Number(it.preco_atual);
        investido += qtd * pm;
        if (pa !== null && !Number.isNaN(pa)) atual += qtd * pa;
      }
    }

    const lucro = atual - investido;
    const lucroPct = investido > 0 ? (lucro / investido) * 100 : 0;
    return { investido, atual, lucro, lucroPct };
  }, [items]);

  async function addItem(e) {
    e.preventDefault();
    setErr("");

    const t = ticker.trim().toUpperCase();
    const q = Number(quantidade);
    const pm = Number(precoMedio);

    if (!t || !Number.isFinite(q) || q <= 0 || !Number.isFinite(pm) || pm <= 0) {
      setErr("Preencha ticker, quantidade e preço médio (valores > 0).");
      return;
    }

    try {
      await apiPost("/wallet", { ticker: t, quantidade: q, preco_medio: pm });
      setTicker(""); setQuantidade(""); setPrecoMedio("");
      await load();
    loadHistory();
    } catch (e2) {
      setErr("Falha ao adicionar ativo. Verifique Supabase e tabela.");
    }
  }

  async function remove(id) {
    if (!confirm("Remover este ativo da carteira?")) return;
    setErr("");
    try {
      await apiDelete(`/wallet/${id}`);
      await load();
    loadHistory();
    } catch {
      setErr("Falha ao remover ativo.");
    }
  }

  async function removeByTicker(ticker) {
    if (!confirm(`Remover todas as compras de ${ticker}?`)) return;
    setErr("");
    try {
      await apiDelete(`/wallet/ticker/${encodeURIComponent(ticker)}`);
      await load();
    loadHistory();
    } catch {
      setErr("Falha ao remover ativo.");
    }
  }

  async function forceUpdate() {
    setUpdating(true);
    setErr("");
    try {
      await apiPost("/update", {});
      await load();
    loadHistory();
    } catch {
      setErr("Falha ao atualizar agora. Verifique BRAPI token/limites.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Carteira</h1>
          <p className="muted">Atualiza preços via backend (BRAPI) e salva no Supabase.</p>
        </div>
        
    {lastUpdate && (
      <div className={`updateStatus ${statusColor(lastUpdate)}`}>
        ⏱ {formatRelativeTime(lastUpdate)} ({new Date(lastUpdate).toLocaleTimeString("pt-BR")})
      </div>
    )}
    <button className="btn" onClick={forceUpdate} disabled={updating}>
    
          {updating ? "Atualizando..." : "Atualizar agora"}
        </button>
      </header>

      <section className="cards">
        <div className="card">
          <div className="label">Investido</div>
          <div className="value">{formatBRL(totals.investido)}</div>
        </div>
        <div className="card">
          <div className="label">Valor atual</div>
          <div className="value">{formatBRL(totals.atual)}</div>
        </div>
        <div className="card">
          <div className="label">Resultado</div>
          <div className="value">{formatBRL(totals.lucro)}</div>
          <div className="sub">{pct(totals.lucroPct)}</div>
        </div>

        <DividendSummary />

        <PassiveIncomeChart />

      </section>

      <section className="grid">
        <AddAssetForm
          ticker={ticker}
          setTicker={setTicker}
          quantidade={quantidade}
          setQuantidade={setQuantidade}
          precoMedio={precoMedio}
          setPrecoMedio={setPrecoMedio}
          addItem={addItem}
          err={err}
        />
        
        <WalletTable
          items={items}
          loading={loading}
          history={history}
          removeByTicker={removeByTicker}
          formatBRL={formatBRL}
          signedBRL={signedBRL}
          pct={pct}
        />

        


          
      </section>

      <footer className="footer muted">
        Backend: FastAPI • Banco: Supabase • Dados: BRAPI
      </footer>
    </div>
  );




}

