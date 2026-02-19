"use client"

import { useEffect, useState } from "react"
import { Trash2, FileText, Image, Download } from "lucide-react"
import { Button } from "./button"
import { auth } from "@/lib/db"

interface UploadedFile {
  id: string
  fileName: string
  fileType: "photo" | "document"
  fileData?: string
  uploadedAt: string
}

interface FileDisplayProps {
  files: UploadedFile[]
  onDelete?: (fileId: string) => void
}

export function FileDisplay({ files, onDelete }: FileDisplayProps) {
  const [isCoordinator, setIsCoordinator] = useState(false)

  useEffect(() => {
    try {
      setIsCoordinator(auth.isCoordinator())
    } catch {
      setIsCoordinator(false)
    }
  }, [])

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        body: JSON.stringify({ fileId }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok && onDelete) {
        onDelete(fileId)
      }
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="group flex items-center justify-between p-2 border rounded"
        >
          <div className="flex items-center space-x-2">
            {file.fileType === "photo" ? (
              <Image className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span className="truncate">{file.fileName}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Download link - use file path */}
            {file.fileData ? (
              <a
                href={file.fileData}
                download={file.fileName}
                className="inline-flex"
                aria-label={`Download ${file.fileName}`}
              >
                <Button size="icon" variant="outline">
                  <Download className="w-4 h-4" />
                </Button>
              </a>
            ) : (
              <Button size="icon" variant="outline" disabled>
                <Download className="w-4 h-4" />
              </Button>
            )}

            {/* Delete is hidden by default and shown on hover; only for coordinators */}
            {isCoordinator && onDelete && (
              <button
                onClick={() => handleDelete(file.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive p-2 rounded"
                aria-label={`Delete ${file.fileName}`}
                title="Delete file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
