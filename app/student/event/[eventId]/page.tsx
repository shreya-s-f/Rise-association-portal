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
  Image as ImageIcon,
  FileText,
  ExternalLink
} from "lucide-react"

export default function StudentEventDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<UploadedFile | null>(null)

  useEffect(() => {
    if (!auth.isAuthenticated()) {
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
        const eventFiles = await db.getFilesByEventId(eventId)
        setFiles(eventFiles)
      }
    } catch (error) {
      console.error('Failed to load event data:', error)
    } finally {
      setIsLoading(false)
    }
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

  const photos = files.filter((f) => f.fileType === "photo")
  const documents = files.filter((f) => f.fileType === "document")

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/student")}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Student Portal
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              RISE Association
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading event details...</p>
          </div>
        ) : !event ? (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
            <p className="text-lg">Event not found</p>
            <Button onClick={() => router.push("/student")} className="mt-4 bg-indigo-600 hover:bg-indigo-500">
              Return to Events
            </Button>
          </div>
        ) : (
          <>
            {/* Event Hero Details Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-sm px-3 py-1">
                  Academic Year {event.year}
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm px-3 py-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {event.numberOfDays} day{event.numberOfDays > 1 ? "s" : ""} duration
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                {event.eventName}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 mb-6 pb-6 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Coordinator: <strong className="text-white">{event.coordinatorName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Date: <strong className="text-white">{event.eventDate}</strong></span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Event Description</h3>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line text-base">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Photos Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Event Gallery ({photos.length})</h2>
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="glass-panel p-8 text-center text-slate-400 rounded-xl">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p>No photos uploaded for this event yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="glass-card rounded-xl overflow-hidden group border border-slate-800/80 hover:border-indigo-500/50 transition-all flex flex-col"
                    >
                      <div
                        className="aspect-video relative bg-slate-900 overflow-hidden cursor-pointer"
                        onClick={() => setActiveImage(photo)}
                      >
                        <img
                          src={photo.fileData}
                          alt={photo.fileName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-xs bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-medium flex items-center gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" /> View Full
                          </span>
                        </div>
                      </div>
                      <div className="p-3.5 flex items-center justify-between gap-2 mt-auto">
                        <p className="text-xs font-medium text-slate-300 truncate" title={photo.fileName}>
                          {photo.fileName}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(photo)}
                          className="text-xs h-7 px-2 text-indigo-400 hover:text-white hover:bg-indigo-600/30"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-white">Event Documents ({documents.length})</h2>
              </div>

              {documents.length === 0 ? (
                <div className="glass-panel p-8 text-center text-slate-400 rounded-xl">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p>No documents uploaded for this event yet.</p>
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
                      <Button
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="bg-purple-600 hover:bg-purple-500 text-white h-8 px-3 text-xs flex-shrink-0"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Image Lightbox Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={activeImage.fileData}
              alt={activeImage.fileName}
              className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl border border-slate-700"
            />
            <div className="flex items-center justify-between w-full mt-3 px-2">
              <span className="text-sm text-slate-200 truncate">{activeImage.fileName}</span>
              <Button
                size="sm"
                onClick={() => handleDownload(activeImage)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Download className="w-4 h-4 mr-1.5" /> Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
