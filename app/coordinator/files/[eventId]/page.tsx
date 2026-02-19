"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { auth, db, type Event, type UploadedFile } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { FileDisplay } from "@/components/ui/file-display"

export default function EventFilesPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      title: "Success",
      description: "File downloaded successfully!",
    })
  }

  const handleDelete = async (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      try {
        await db.deleteFile(fileId)
        toast({
          title: "Success",
          description: "File deleted successfully!",
        })
        if (event) {
          await loadFiles(event.id)
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete file",
          variant: "destructive",
        })
      }
    }
  }

  const photos = files.filter((f) => f.fileType === "photo")
  const documents = files.filter((f) => f.fileType === "document")

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/coordinator")}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {event && (
          <>
            <Card className="mb-8 border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="gradient-primary text-lg py-1">{event.year}</Badge>
                </div>
                <CardTitle className="text-2xl">{event.eventName}</CardTitle>
                <CardDescription>
                  <div className="space-y-1 mt-2">
                    <p>
                      <strong>Year:</strong> {event.year}
                    </p>
                    <p>
                      <strong>Coordinator:</strong> {event.coordinatorName}
                    </p>
                    <p>
                      <strong>Date:</strong> {event.eventDate}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Files uploaded for this event and year are isolated and won't affect other years or events
                    </p>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileDisplay files={files} onDelete={(fileId: string) => { db.deleteFile(fileId); loadFiles(event.id); }} />
              </CardContent>
            </Card>

            {/* Photos Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Photos ({photos.length})
              </h2>

              {photos.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No photos uploaded for this event and year</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video relative bg-muted">
                        <img
                          src={photo.fileData || "/placeholder.svg"}
                          alt={photo.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm font-medium truncate mb-2" title={photo.fileName}>
                          {photo.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {new Date(photo.uploadedAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleDownload(photo)} className="flex-1">
                            Download
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(photo.id)}>
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Documents ({documents.length})
              </h2>

              {documents.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No documents uploaded for this event and year</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>
                            Download
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
