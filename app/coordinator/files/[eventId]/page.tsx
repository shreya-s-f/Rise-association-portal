"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { auth, db, type Event, type UploadedFile } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Download,
  Trash2,
  Image as ImageIcon,
  FileText,
  Upload,
  AlertTriangle
} from "lucide-react"

export default function EventFilesPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null)

  useEffect(() => {
    if (!auth.isAuthenticated() || !auth.isCoordinator()) {
      router.push("/login")
      return
    }

    loadEventData()
  }, [params, router])

  const loadEventData = async () => {
    try {
      setIsLoading(true)
      const eventId = params.eventId as string
      const events = await db.getEvents()
      const foundEvent = events.find((e) => e.id === eventId)

      if (foundEvent) {
        setEvent(foundEvent)
        await loadFiles(eventId)
      }
    } catch (error) {
      console.error('Failed to load event data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFiles = async (eventId: string) => {
    const eventFiles = await db.getFilesByEventId(eventId)
    setFiles(eventFiles)
  }

  const handleDownload = (file: UploadedFile) => {
    const link = document.createElement("a")
    link.href = file.fileData
    link.download = file.fileName
    link.click()

    toast({
      title: "Download Started",
      description: `Downloading ${file.fileName}`,
    })
  }

  const handleDelete = async (file: UploadedFile) => {
    try {
      await db.deleteFile(file.id)
      toast({
        title: "File Deleted",
        description: `Successfully deleted ${file.fileName}`,
      })
      if (event) {
        await loadFiles(event.id)
      }
      setFileToDelete(null)
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const photos = files.filter((f) => f.fileType === "photo")
  const documents = files.filter((f) => f.fileType === "document")

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/coordinator")}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <span className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full font-medium">
            Coordinator File Management
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading event and file repository...</p>
          </div>
        ) : !event ? (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
            <p className="text-lg">Event not found</p>
            <Button onClick={() => router.push("/coordinator")} className="mt-4 bg-indigo-600 hover:bg-indigo-500">
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <>
            {/* Event Summary Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Academic Year {event.year}
                  </Badge>
                  <Badge className="bg-slate-800 text-slate-300 border border-slate-700">
                    {files.length} Total Files
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{event.eventName}</h1>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>Coordinator: <strong className="text-slate-200">{event.coordinatorName}</strong></span>
                  <span>•</span>
                  <span>Date: <strong className="text-slate-200">{event.eventDate}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => router.push("/coordinator")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                >
                  <Upload className="w-4 h-4 mr-2" /> Upload More Files
                </Button>
              </div>
            </div>

            {/* Photos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-white">Event Photos ({photos.length})</h2>
              </div>

              {photos.length === 0 ? (
                <div className="glass-panel p-8 text-center text-slate-400 rounded-xl">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>No photos uploaded for this event.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="glass-card rounded-xl overflow-hidden group border border-slate-800/80 flex flex-col"
                    >
                      <div className="aspect-video relative bg-slate-900 overflow-hidden">
                        <img
                          src={photo.fileData}
                          alt={photo.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3.5 space-y-2.5 mt-auto">
                        <p className="text-xs font-medium text-slate-200 truncate" title={photo.fileName}>
                          {photo.fileName}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(photo)}
                            className="flex-1 text-xs h-7 border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-200"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> Download
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setFileToDelete(photo)}
                            className="text-xs h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-white">Event Documents ({documents.length})</h2>
              </div>

              {documents.length === 0 ? (
                <div className="glass-panel p-8 text-center text-slate-400 rounded-xl">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p>No documents uploaded for this event.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="glass-card p-4 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-200 text-sm truncate" title={doc.fileName}>
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          className="bg-purple-600 hover:bg-purple-500 text-white h-8 px-3 text-xs"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Download
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setFileToDelete(doc)}
                          className="text-xs h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Delete File?</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete <strong className="text-white">{fileToDelete.fileName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setFileToDelete(null)}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(fileToDelete)}
                className="bg-rose-600 hover:bg-rose-500 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
