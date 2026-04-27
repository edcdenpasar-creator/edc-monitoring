"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// 🔥 SUPABASE
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 🔹 CARD
const Card = ({ title, value }: any) => (
  <div className="bg-white shadow-md border rounded-xl p-4">
    <p className="text-gray-900 font-semibold">{title}</p>
    <p className="text-xl font-bold text-black">{value}</p>
  </div>
)

export default function Dashboard() {
  const [data, setData] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedRM, setSelectedRM] = useState<any>(null)
  const [detailData, setDetailData] = useState<any[]>([])

  // 🔥 FETCH
  useEffect(() => {
    const fetchData = async () => {
  const { data, error } = await supabase
    .from("edc_rmft")
    .select("*", { count: "exact" })
    .range(0, 20000)

  if (error) {
    console.error(error)
  } else {
    console.log("TOTAL FETCH:", data?.length)
    setData(data || [])
  }
}

    fetchData()
  }, [])

  const normalize = (text: any) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim()

const keyword = normalize(search)
const keywordPN = keyword.replace(/\D/g, "")

const filteredRaw = data.filter((item: any) => {
  const nama = normalize(item.nama_rm)
  const cabang = normalize(item.branch_office)
  const merchant = normalize(item.nama_merchant)
  const pn = String(item.pn_rm || "").replace(/\D/g, "")

  return (
    nama.includes(keyword) ||
    cabang.includes(keyword) ||
    merchant.includes(keyword) ||
    pn.includes(keywordPN)
  )
})

  // 🔥 GROUP
  const grouped: any = {}

  filteredRaw.forEach((item: any) => {
    const key = item.nama_rm

    if (!grouped[key]) {
      grouped[key] = {
        nama_rm: item.nama_rm,
        branch_office: item.branch_office,
        total: 0,
        produktif: 0,
        tidak: 0
      }
    }

    grouped[key].total += 1

    const status = String(item.status_edc || "").toLowerCase().trim()

    if (status === "produktif") {
      grouped[key].produktif += 1
    } else {
      grouped[key].tidak += 1
    }
  })

  const filtered = Object.values(grouped).map((item: any) => ({
    ...item,
    persen:
      item.total > 0 ? (item.produktif / item.total) * 100 : 0
  }))

  const sorted = [...filtered].sort(
    (a: any, b: any) => b.persen - a.persen
  )

  const top = sorted.slice(0, 3)
  const worst = sorted.slice(-3)

  const getColor = (p: number) => {
    if (p >= 80) return "text-green-700"
    if (p >= 50) return "text-yellow-600"
    return "text-red-700"
  }

  // 📥 EXPORT GLOBAL CSV
  const exportCSV = () => {
    const headers = [
      "Nama RM",
      "Cabang",
      "Total EDC",
      "EDC Produktif",
      "EDC Tidak Produktif",
      "Persentase"
    ]

    const rows = filtered.map((item: any) => [
      item.nama_rm,
      item.branch_office,
      item.total,
      item.produktif,
      item.tidak,
      item.persen.toFixed(1)
    ])

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(";")).join("\n")

    const link = document.createElement("a")
    link.href = encodeURI(csv)
    link.download = "dashboard_rmft.csv"
    link.click()
  }

  // 📥 EXPORT DETAIL RM CSV
  const exportDetailCSV = () => {
    if (!detailData.length) return

    const headers = [
      "Nama RM",
      "Cabang",
      "Merchant",
      "TID",
      "Status"
    ]

    const rows = detailData.map((item: any) => [
      item.nama_rm,
      item.branch_office,
      item.nama_merchant,
      item.tid_edc,
      item.status_edc
    ])

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(";")).join("\n")

    const link = document.createElement("a")
    link.href = encodeURI(csv)
    link.download = `detail_${selectedRM?.replace(/\s+/g, "_")}.csv`
    link.click()
  }

  // 🔍 DETAIL RM
  const getDetailRM = async (nama_rm: string) => {
    const { data, error } = await supabase
      .from("edc_rmft")
      .select("*")
      .eq("nama_rm", nama_rm)

    if (error) console.error(error)
    else {
      setDetailData(data || [])
      setSelectedRM(nama_rm)
    }
  }

  return (
    <main className="p-6 bg-white min-h-screen text-black">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Dashboard Produktivitas EDC per RMFT
        </h1>

        {/*}
        <button
          onClick={exportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          ⬇️ Export CSV
        </button>
        */}
      </div> 
      

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Cari Nama RM / PN / Cabang..."
        className="w-full border border-gray-300 p-3 rounded mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card title="Total RM per EDC" value={filtered.length.toLocaleString("id-ID")} />

        <Card
          title="EDC Produktif"
          value={filteredRaw.filter(
            (item) => item.status_edc === "produktif"
          ).length.toLocaleString("id-ID")}
        />

        <Card
          title="EDC Tidak Produktif"
          value={filteredRaw.filter(
            (item) => item.status_edc !== "produktif"
          ).length.toLocaleString("id-ID")}
        />
      </div>

      {/* TOP */}
      <h2 className="mb-2 font-semibold text-lg">
        🔥 Top Performer
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {top.map((item: any, i: number) => (
          <div
            key={i}
            onClick={() => getDetailRM(item.nama_rm)}
            className="bg-green-500 text-white p-4 rounded-xl cursor-pointer"
          >
            <p className="font-bold">
              #{i + 1} {item.nama_rm}
            </p>
            <p>{item.branch_office}</p>
            <p>{item.persen.toFixed(1)}%</p>
          </div>
        ))}
      </div>

      {/* WORST */}
      <h2 className="mb-2 font-semibold text-lg">
        ⚠️ Perlu Perhatian
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {worst.map((item: any, i: number) => (
          <div
            key={i}
            onClick={() => getDetailRM(item.nama_rm)}
            className="bg-red-500 text-white p-4 rounded-xl cursor-pointer"
          >
            <p className="font-bold">
              #{i + 1} {item.nama_rm}
            </p>
            <p>{item.branch_office}</p>
            <p>{item.persen.toFixed(1)}%</p>
          </div>
        ))}
      </div>

      {/* ALL RM */}
      <h2 className="mb-2 font-semibold text-lg">
        📊 Performa Seluruh RM
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {sorted.map((item: any, i: number) => (
          <div
            key={i}
            onClick={() => getDetailRM(item.nama_rm)}
            className={`p-4 rounded-xl border cursor-pointer ${
              item.persen >= 80
                ? "bg-green-100"
                : item.persen >= 50
                ? "bg-yellow-100"
                : "bg-red-100"
            }`}
          >
            <p className="font-bold">
              #{i + 1} {item.nama_rm}
            </p>

            <p className="text-sm text-gray-700">
              {item.branch_office}
            </p>

            <p className="text-sm mt-2">
              Total: {item.total}
            </p>

            <p className="text-sm">
              Produktif: {item.produktif}
            </p>

            <p className={`mt-2 font-bold ${getColor(item.persen)}`}>
              {item.persen.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

      {/* MODAL DETAIL */}
      {selectedRM && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[800px] max-h-[80vh] overflow-auto">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Detail RM: {selectedRM}
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={exportDetailCSV}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                >
                  ⬇️ Export CSV
                </button>

                <button
                  onClick={() => setSelectedRM(null)}
                  className="bg-gray-300 px-3 py-1 rounded-lg text-sm"
                >
                  ❌
                </button>
              </div>
            </div>

            <p>Total EDC: {detailData.length}</p>
            <p>
              Produktif:{" "}
              {detailData.filter(d => d.status_edc === "produktif").length}
            </p>
            <p>
              Tidak Produktif:{" "}
              {detailData.filter(d => d.status_edc !== "produktif").length}
            </p>

            <table className="w-full mt-4 text-sm">
              <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Merchant</th>
                    <th className="p-2 text-left">TID</th>
                    <th className="p-2 text-left">Alamat</th>
                    <th className="p-2 text-left">Sales Volume</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>

              <tbody>
                {detailData.map((d, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{d.nama_merchant}</td>

                        <td className="p-2">{d.tid_edc}</td>

                        <td className="p-2">
                          {d.alamat || "-"}
                        </td>

                        <td className="p-2">
                          {d.sales_volume
                            ? Number(d.sales_volume).toLocaleString("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                maximumFractionDigits: 0
                              })
                            : "-"}
                        </td>

                        <td
                          className={`p-2 font-bold ${
                            d.status_edc === "produktif"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {d.status_edc}
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      )}
    </main>
  )
}