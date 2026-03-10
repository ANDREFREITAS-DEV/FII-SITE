
import { PieChart, Pie, Cell, Tooltip } from "recharts"

export default function AllocationChart({items}){

  const data = items.map(i=>({
    name:i.ticker,
    value:i.quantidade * i.preco_atual
  }))

  const colors = ["#0088FE","#00C49F","#FFBB28","#FF8042","#aa66cc"]

  return(
    <div>
      <h3>Alocação</h3>
      <PieChart width={400} height={300}>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={120}>
          {data.map((entry, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip/>
      </PieChart>
    </div>
  )
}
