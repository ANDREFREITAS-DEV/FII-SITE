import React from "react"

export default function AddAssetForm({
  ticker,
  setTicker,
  quantidade,
  setQuantidade,
  precoMedio,
  setPrecoMedio,
  addItem,
  err
}) {

  return (
    <form className="panel" onSubmit={addItem}>
      <h2>Novo ativo</h2>

      <label>
        Ticker
        <input
          value={ticker}
          onChange={(e)=>setTicker(e.target.value)}
          placeholder="HGLG11"
        />
      </label>

      <label>
        Quantidade
        <input
          value={quantidade}
          onChange={(e)=>setQuantidade(e.target.value)}
          placeholder="10"
          inputMode="decimal"
        />
      </label>

      <label>
        Preço médio (R$)
        <input
          value={precoMedio}
          onChange={(e)=>setPrecoMedio(e.target.value)}
          placeholder="156.70"
          inputMode="decimal"
        />
      </label>

      <button className="btn primary" type="submit">
        Adicionar
      </button>

      {err && <div className="error">{err}</div>}
    </form>
  )
}