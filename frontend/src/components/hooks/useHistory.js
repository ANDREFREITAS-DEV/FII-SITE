import { useEffect, useState } from "react"

export default function useHistory(){

  const [history,setHistory] = useState([])

  async function loadHistory(){

    const res = await fetch("http://localhost:8000/history")
    const data = await res.json()

    setHistory(data.history || [])

  }

  useEffect(()=>{
    loadHistory()
  },[])

  return {
    history,
    reload:loadHistory
  }

}