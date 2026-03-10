import { useEffect, useState } from "react"
import { apiGet } from "../services/api"

export default function useWallet() {

  const [items,setItems] = useState([])
  const [loading,setLoading] = useState(true)
  const [lastUpdate,setLastUpdate] = useState(null)

  async function loadWallet(){

    setLoading(true)

    try{

      const data = await apiGet("/wallet")

      setItems(data.items || [])
      setLastUpdate(data.last_update)

    } finally{
      setLoading(false)
    }

  }

  useEffect(()=>{
    loadWallet()
  },[])

  return {
    items,
    loading,
    lastUpdate,
    reload:loadWallet
  }

}