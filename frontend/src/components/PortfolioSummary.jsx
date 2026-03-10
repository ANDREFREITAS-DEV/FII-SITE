
export default function PortfolioSummary({items}){
  const investido = items.reduce((a,i)=>a + (i.quantidade * i.preco_medio),0)
  const atual = items.reduce((a,i)=>a + (i.quantidade * i.preco_atual),0)
  const pnl = atual - investido
  const pct = investido ? (pnl/investido*100) : 0

  return (
    <div style={{display:"flex",gap:30,marginBottom:30}}>
      <div>
        <h3>Patrimônio</h3>
        <strong>R$ {atual.toFixed(2)}</strong>
      </div>
      <div>
        <h3>Investido</h3>
        <strong>R$ {investido.toFixed(2)}</strong>
      </div>
      <div>
        <h3>Resultado</h3>
        <strong style={{color:pnl>=0?"green":"red"}}>
          {pnl.toFixed(2)} ({pct.toFixed(2)}%)
        </strong>
      </div>
    </div>
  )
}
