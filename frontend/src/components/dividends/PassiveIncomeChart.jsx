import React, { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)
export default function PassiveIncomeChart(){

  const [data,setData] = useState([])

  async function load(){

    const res = await fetch("http://localhost:8000/dividends/monthly")

    const json = await res.json()

    setData(json.months || [])

  }

  useEffect(()=>{
    load()
  },[])

  const chartData = {
    labels: data.map(i=>i.mes),
    datasets:[
      {
        label:"Renda mensal",
        data:data.map(i=>i.valor),
        borderColor:"#4CAF50",
        backgroundColor:"rgba(76,175,80,0.2)",
        tension:0.3
      }
    ]
  }

  return(

    <div className="panel">

      <h2>Renda Passiva Mensal</h2>

      <Line data={chartData}/>

    </div>

  )

}