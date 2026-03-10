import React from "react"
import PortfolioSummary from "../PortfolioSummary"
import PortfolioChart from "../PortfolioChart"
import AllocationChart from "../AllocationChart"

export default function WalletTable({
  items,
  loading,
  history,
  removeByTicker,
  formatBRL,
  signedBRL,
  pct
}) {

  return (

    <div className="panel">

      <h2>Ativos</h2>

      {loading && <div className="muted">Carregando...</div>}

      <div className="tableWrap">

        <PortfolioSummary items={items}/>
        <PortfolioChart history={history}/>
        <AllocationChart items={items}/>

        <table>

          <thead>
            <tr>
              <th>Ticker</th>
              <th>Nome</th>
              <th>Qtd</th>
              <th>Investido</th>
              <th>Valor atual</th>
              <th>Resultado</th>
              <th>P. Médio</th>
              <th>P. Atual</th>
              <th>Variação</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            {items.length === 0 && !loading && (
              <tr>
                <td colSpan="10" className="muted">
                  Nenhum ativo ainda.
                </td>
              </tr>
            )}

            {items.map((it)=>(
              <tr key={it.ticker}>

                <td className="mono">{it.ticker}</td>

                <td>{it.nome || "-"}</td>

                <td>{Number(it.quantidade || 0)}</td>

                <td>{formatBRL(it.investido)}</td>

                <td>{formatBRL(it.valor_atual)}</td>

                <td className={Number(it.pnl || 0) >= 0 ? "pos" : "neg"}>
                  {signedBRL(it.pnl)}
                  <span className="muted">
                    ({pct(it.pnl_pct)})
                  </span>
                </td>

                <td>{formatBRL(it.preco_medio)}</td>

                <td>{formatBRL(it.preco_atual)}</td>

                <td>{pct(it.variacao_pct)}</td>

                <td className="actions">
                  <button
                    className="btn small"
                    onClick={()=>removeByTicker(it.ticker)}
                  >
                    Remover
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

        <h2 style={{marginTop:40}}>Histórico da Carteira</h2>

        <ul>
          {history.map(h=>(
            <li key={h.data}>
              {h.data} - Patrimônio: R$ {Number(h.valor_total).toFixed(2)}
            </li>
          ))}
        </ul>

      </div>

      <p className="muted footnote">
        Dica: se sua BRAPI estiver sem token, use atualização a cada 5–15 min para não bater limite.
      </p>

    </div>

  )

}