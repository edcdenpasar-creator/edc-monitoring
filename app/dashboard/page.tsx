"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Dashboard() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("edc_rmft")
      .select("*")

    if (error) {
      console.log(error)
      return
    }

    // 🔥 GROUPING PER RM
    const grouped: any = {}

    data.forEach((item: any) => {
      const key = item.nama_rm

      if (!grouped[key]) {
        grouped[key] = {
          nama_rm: item.nama_rm,
          total: 0,
          produktif: 0
        }
      }

      grouped[key].total += 1

      const status = item.status_edc?.toLowerCase().trim()

if (status === "produktif") {
  grouped[key].produktif += 1
}
    })

    // 🔥 HITUNG %
    const result = Object.values(grouped).map((item: any) => ({
      ...item,
      persen: ((item.produktif / item.total) * 100).toFixed(1)
    }))

    // 🔥 SORT TERBAIK
    result.sort((a: any, b: any) => b.persen - a.persen)

    setData(result)
  }

  return (
  <main className="p-4 bg-gray-100 min-h-screen">
    <h1 className="text-2xl font-bold mb-4 text-black">
      Dashboard RMFT
    </h1>

    <div className="grid gap-4 md:grid-cols-2">
      {data.map((item, i) => (
        <div key={i} className="p-4 bg-white rounded-xl shadow-md border">
          
          <p className="font-bold text-lg text-black">
            {item.nama_rm}
          </p>

          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <p>Total EDC: <span className="font-semibold">{item.total}</span></p>
            <p>Produktif: <span className="font-semibold">{item.produktif}</span></p>
          </div>

          <p className={`mt-3 text-lg font-bold ${
            item.persen >= 80 ? "text-green-600" :
            item.persen >= 50 ? "text-yellow-500" :
            "text-red-500"
          }`}>
            {item.persen}%
          </p>

        </div>
      ))}
    </div>
  </main>
)
}