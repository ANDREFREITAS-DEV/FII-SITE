
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export default function PortfolioChart({history}){

  const data = history.map(h=>({
    date:h.data,
    value:h.valor_total
  }))

  return(
    <div>
      <h3>Evolução</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="date"/>
        <YAxis/>
        <Tooltip/>
        <Line type="monotone" dataKey="value" stroke="#8884d8"/>
      </LineChart>
    </div>
  )
}
