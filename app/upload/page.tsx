"use client"

import * as XLSX from "xlsx"
import { supabase } from "../../lib/supabase"

export default function UploadPage() {

  const handleFile = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const json: any[] = XLSX.utils.sheet_to_json(sheet)

    // 🔥 HAPUS DATA LAMA
    await supabase.from("edc_rmft").delete().not("id", "is", null)

    // 🔥 FORMAT DATA
   console.log("RAW:", json)

// 🔥 FORMAT DATA
const formatted = json.map(row => {
  const newRow: any = {}

  Object.keys(row).forEach(key => {
    const cleanKey = key.trim().toLowerCase()

    if (cleanKey === "nama rm") newRow.nama_rm = row[key]
    if (cleanKey === "pn") newRow.pn_rm = String(row[key] ?? "")
    if (cleanKey === "cabang") newRow.branch_office = row[key]
    if (cleanKey === "kcp") newRow.kcp = String(row[key] ?? "")
    if (cleanKey === "nama merchant") newRow.nama_merchant = row[key]
    if (cleanKey === "mid") newRow.mid_edc = String(row[key] ?? "")
    if (cleanKey === "tid") newRow.tid_edc = String(row[key] ?? "")
    if (cleanKey === "status") newRow.status_edc = row[key]
  })

  return newRow
})

console.log("FORMATTED:", formatted)

    const { error } = await supabase.from("edc_rmft").insert(formatted)

    if (error) {
      console.log(error)
      alert("Upload gagal ❌")
    } else {
      alert("Upload sukses 🚀")
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Upload Data EDC</h1>
      <input type="file" onChange={handleFile} className="mt-4" />
    </main>
  )
}