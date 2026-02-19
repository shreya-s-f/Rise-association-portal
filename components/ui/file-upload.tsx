import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"

interface FileUploadProps {
  eventId: string
  onUpload?: () => void
}

export function FileUpload({ eventId, onUpload }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      alert("File size exceeds 10MB limit. Please choose a smaller file.")
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("eventId", eventId)
      formData.append(
        "fileType",
        file.type.startsWith("image/") ? "photo" : "document"
      )

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        if (onUpload) onUpload()
      } else {
        const errorData = await response.json()
        alert(`Upload failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("An error occurred while uploading the file. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        body: JSON.stringify({ fileId }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        if (onUpload) onUpload()
      }
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleUpload}
        disabled={uploading}
        className="flex-1"
      />
      <Button disabled={uploading}>
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </div>
  )
}