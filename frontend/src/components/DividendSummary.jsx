import { useEffect, useState } from "react"

export default function DividendSummary(){

  const [data,setData] = useState(null)

  useEffect(()=>{

    async function load(){

      const res = await fetch("http://localhost:8000/dividends")
      const json = await res.json()

      setData(json)

    }

    load()

  },[])

  if(!data){
    return <div className="card">Carregando dividendos...</div>
  }

  // ordenar ativos por renda
  const ativosOrdenados = [...data.por_ativo]
    .sort((a,b)=>b.renda_mensal - a.renda_mensal)

  const max = ativosOrdenados[0]?.renda_mensal || 1

  return (

    <div className="card">

      <div className="label">Dividendos Mensais</div>

      <div className="value">
        R$ {data.dividendos_mensais.toFixed(2)}
      </div>

      <div className="sub">
        Yield mensal: {data.yield_mensal.toFixed(2)}%
      </div>

      <div className="sub">
        Yield anual: {data.yield_anual.toFixed(2)}%
      </div>

      <div style={{marginTop:20}}>

        <div className="label">
          Top pagadores
        </div>

        {ativosOrdenados.map((ativo)=>{

          const width = (ativo.renda_mensal / max) * 100

          return (

            <div key={ativo.ticker} style={{marginTop:10}}>

              <div style={{
                display:"flex",
                justifyContent:"space-between",
                fontSize:13
              }}>

                <span>{ativo.ticker}</span>

                <span>
                  R$ {ativo.renda_mensal.toFixed(2)}
                </span>

              </div>

              <div style={{
                height:6,
                background:"#1f2937",
                borderRadius:4,
                marginTop:4
              }}>

                <div style={{
                  width:`${width}%`,
                  height:6,
                  background:"#22c55e",
                  borderRadius:4
                }} />

              </div>

            </div>

          )

        })}

      </div>

    </div>

  )

}