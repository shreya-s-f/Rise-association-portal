import { NextRequest, NextResponse } from "next/server"
import { db, auth } from "@/lib/server-db-functions"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = authHeader.substring(7) // Remove 'Bearer ' prefix
    let currentUser: any = null
    try {
      currentUser = JSON.parse(userData)
    } catch {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const events = await db.getEvents()
    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Error fetching events" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = authHeader.substring(7) // Remove 'Bearer ' prefix
    let currentUser: any = null
    try {
      currentUser = JSON.parse(userData)
    } catch {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    if (!currentUser || currentUser.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventData = await request.json()
    const newEvent = await db.createEvent(eventData)
    return NextResponse.json(newEvent)
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: "Error creating event" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = authHeader.substring(7) // Remove 'Bearer ' prefix
    let currentUser: any = null
    try {
      currentUser = JSON.parse(userData)
    } catch {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    if (!currentUser || currentUser.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId, eventData } = await request.json()
    const success = await db.updateEvent(eventId, eventData)
    if (!success) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      { error: "Error updating event" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = authHeader.substring(7) // Remove 'Bearer ' prefix
    let currentUser: any = null
    try {
      currentUser = JSON.parse(userData)
    } catch {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    if (!currentUser || currentUser.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { eventId } = await request.json()
    const success = await db.deleteEvent(eventId)
    if (!success) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Error deleting event" },
      { status: 500 }
    )
  }
}