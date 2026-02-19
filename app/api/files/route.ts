import { NextRequest, NextResponse } from "next/server"
import { db, auth } from "@/lib/server-db-functions"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const UPLOAD_DIR = join(process.cwd(), "public", "uploads")

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
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

    const formData = await req.formData()
    const file = formData.get("file") as File
    const eventId = formData.get("eventId") as string
    const fileType = formData.get("fileType") as "photo" | "document"

    if (!file || !eventId || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filePath = join(UPLOAD_DIR, uniqueFileName)

    // Convert file to buffer and save
    const buffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(buffer))

    // Save file metadata to database
    const uploadedFile = await db.createFile({
      eventId,
      fileName: file.name,
      fileType,
      fileData: `/uploads/${uniqueFileName}`, // Store file path instead of base64
      uploadedBy: currentUser.id,
    })

    return NextResponse.json(uploadedFile)
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
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

    const { fileId } = await req.json()
    if (!fileId) {
      return NextResponse.json(
        { error: "Missing file ID" },
        { status: 400 }
      )
    }

    // Get file info before deleting
    const files = await db.getFiles()
    const fileToDelete = files.find(f => f.id === fileId)

    if (!fileToDelete) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    // Delete file from disk
    try {
      const filePath = join(process.cwd(), "public", fileToDelete.fileData)
      await unlink(filePath)
    } catch (fileError) {
      console.warn("Could not delete file from disk:", fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const success = await db.deleteFile(fileId)
    if (!success) {
      return NextResponse.json(
        { error: "File not found in database" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { error: "Error deleting file" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
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

    const url = new URL(req.url)
    const year = url.searchParams.get("year")

    let files: any[]
    if (year) {
      files = await db.getFilesByYear(year)
    } else {
      files = await db.getFiles()
    }

    if (year) {
      const events = await db.getEventsByYear(year)
      const organizedFiles = events.map(event => ({
        event,
        files: files.filter(file => file.eventId === event.id)
      }))
      return NextResponse.json(organizedFiles)
    } else {
      // Return all files with their event info
      const events = await db.getEvents()
      const organizedFiles = events.map(event => ({
        event,
        files: files.filter(file => file.eventId === event.id)
      }))
      return NextResponse.json(organizedFiles)
    }
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { error: "Error fetching files" },
      { status: 500 }
    )
  }
}