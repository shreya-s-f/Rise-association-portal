import { NextRequest, NextResponse } from "next/server"
import { db, auth } from "@/lib/server-db-functions"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const currentUser = auth.getUserFromAuthHeader(authHeader)

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeFiles = searchParams.get('includeFiles') === 'true'
    const year = searchParams.get('year')

    let events = includeFiles ? db.getEventsWithFiles() : db.getEvents()

    if (year && year !== 'all') {
      events = events.filter((e) => e.year === year)
    }

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
    const currentUser = auth.getUserFromAuthHeader(authHeader)

    if (!currentUser || currentUser.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized - Coordinator access required" }, { status: 401 })
    }

    const eventData = await request.json()
    const newEvent = db.createEvent({
      ...eventData,
      createdBy: currentUser.id,
    })
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
    const currentUser = auth.getUserFromAuthHeader(authHeader)

    if (!currentUser || currentUser.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized - Coordinator access required" }, { status: 401 })
    }

    const { eventId, eventData } = await request.json()
    const updated = db.updateEvent(eventId, eventData)
    if (!updated) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }
    return NextResponse.json(updated)
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
    const currentUser = auth.getUserFromAuthHeader(authHeader)

    if (!currentUser || currentUser.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized - Coordinator access required" }, { status: 401 })
    }

    const { eventId } = await request.json()
    const success = db.deleteEvent(eventId)
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