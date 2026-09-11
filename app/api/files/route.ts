import { NextRequest, NextResponse } from "next/server"
import { db, auth } from "@/lib/server-db-functions"
import { writeFile, mkdir, unlink } from "fs/promises"
import { join } from "path"

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const UPLOAD_DIR = join(process.cwd(), "public", "uploads")

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const currentUser = auth.getUserFromAuthHeader(authHeader)

    if (!currentUser || currentUser.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized - Coordinator access required" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const eventId = formData.get("eventId") as string
    const fileType = formData.get("fileType") as "photo" | "document"

    if (!file || !eventId || !fileType) {
      return NextResponse.json(
        { error: "Missing required fields (file, eventId, fileType)" },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 15MB limit" },
        { status: 400 }
      )
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Generate unique safe filename
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const fileExtension = originalName.split('.').pop() || "bin"
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`
    const filePath = join(UPLOAD_DIR, uniqueFileName)

    // Convert file to buffer and save
    const buffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(buffer))

    // Save file metadata to database
    const uploadedFile = db.createFile({
      eventId,
      fileName: file.name,
      fileType,
      fileData: `/uploads/${uniqueFileName}`,
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
    const currentUser = auth.getUserFromAuthHeader(authHeader)

    if (!currentUser || currentUser.role !== "coordinator") {
      return NextResponse.json({ error: "Unauthorized - Coordinator access required" }, { status: 401 })
    }

    const { fileId } = await req.json()
    if (!fileId) {
      return NextResponse.json(
        { error: "Missing file ID" },
        { status: 400 }
      )
    }

    // Get file info before deleting
    const files = db.getFiles()
    const fileToDelete = files.find(f => f.id === fileId)

    if (!fileToDelete) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    // Delete file from disk if exists
    try {
      const cleanPath = fileToDelete.fileData.replace(/^\/+/, '')
      const filePath = join(process.cwd(), "public", cleanPath)
      await unlink(filePath)
    } catch (fileError) {
      console.warn("Could not delete file from disk:", fileError)
    }

    // Delete from database
    const success = db.deleteFile(fileId)
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
    const currentUser = auth.getUserFromAuthHeader(authHeader)

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const year = url.searchParams.get("year")
    const eventId = url.searchParams.get("eventId")

    let files = db.getFiles()

    if (eventId) {
      files = files.filter(f => f.eventId === eventId)
      return NextResponse.json(files)
    }

    if (year && year !== "all") {
      files = files.filter(f => f.year === year)
    }

    // Return flat list or grouped depending on format parameter
    const format = url.searchParams.get("format")
    if (format === "grouped") {
      const events = db.getEvents()
      const organizedFiles = events
        .filter(event => !year || year === "all" || event.year === year)
        .map(event => ({
          event,
          files: files.filter(file => file.eventId === event.id)
        }))
      return NextResponse.json(organizedFiles)
    }

    return NextResponse.json(files)
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { error: "Error fetching files" },
      { status: 500 }
    )
  }
}