import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/server-db-functions"

export async function POST(req: NextRequest) {
  try {
    const userData = await req.json()
    const { email } = userData

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    const newUser = await db.createUser(userData)
    return NextResponse.json(newUser)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    )
  }
}