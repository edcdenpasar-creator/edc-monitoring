"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { supabase } from "@/lib/supabase"

export default function UploadPage() {
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
      // kasih confirm dulu
if (!confirm("Yakin mau replace semua data?")) return

    setLoading(true)

    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]

    const json: any[] = XLSX.utils.sheet_to_json(sheet)

    console.log("RAW EXCEL:", json[0])

    // 🔥 CLEAR DATA LAMA
    await supabase.from("edc_rmft").delete().neq("id", "")

    // 🔥 FORMAT DATA SESUAI HEADER EXCEL
    const formatted = json.map((row: any) => ({
  nama_rm: String(row["Nama RM"] ?? "").trim(),
  pn_rm: String(row["PN"] ?? "").replace(/\D/g, ""),
  branch_office: String(row["Cabang"] ?? "").trim(),
  nama_merchant: String(row["Nama Merchant"] ?? "").trim(),

  // optional (kalau masih disimpan)
  mid_edc: String(row["MID"] ?? "").trim(),

  // 🔥 utama sekarang
  tid_edc: String(row["TID"] ?? "").trim(),

  // 🔥 penting (biar kebaca dashboard)
  status_edc: String(row["Status"] ?? "")
    .toLowerCase()
    .trim(),

  // 🔥 BARU
  alamat: String(row["Alamat"] ?? "").trim(),

  // 🔥 BARU (handle angka besar + koma)
  sales_volume: Number(
    String(row["Sales Volume"] ?? "0").replace(/,/g, "")
  )
}))

    console.log("FORMATTED:", formatted[0])

    const { error } = await supabase.from("edc_rmft").insert(formatted)

    if (error) {
      console.log(error)
      alert("Upload gagal")
    } else {
      alert("Upload berhasil 🔥")
    }

    setLoading(false)
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Upload Excel</h1>

      <input type="file" onChange={handleUpload} />

      {loading && <p className="mt-2">Uploading...</p>}
    </main>
  )
}