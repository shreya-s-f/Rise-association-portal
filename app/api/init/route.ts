import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/server-db-functions"

export async function POST() {
  try {
    initializeDatabase()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      { error: "Error initializing database" },
      { status: 500 }
    )
  }
}