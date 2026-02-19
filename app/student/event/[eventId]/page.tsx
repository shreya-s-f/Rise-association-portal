"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { auth, db, type Event, type UploadedFile } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function StudentEventDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      title: "Success",
      description: "File downloaded successfully!",
    })
  }

  const photos = files.filter((f) => f.fileType === "photo")
  const documents = files.filter((f) => f.fileType === "document")

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/student")}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {event && (
          <>
            {/* Event Details Card */}
            <Card className="mb-8 gradient-primary text-primary-foreground">
              <CardHeader>
                <div className="flex gap-2 mb-3">
                  <Badge className="bg-primary-foreground text-primary">{event.year}</Badge>
                  <Badge className="bg-primary-foreground text-primary">{event.numberOfDays} day(s)</Badge>
                </div>
                <CardTitle className="text-3xl mb-3">{event.eventName}</CardTitle>
                <CardDescription className="text-primary-foreground/90 text-base">
                  <div className="space-y-2">
                    <p>
                      <strong>Coordinator:</strong> {event.coordinatorName}
                    </p>
                    <p>
                      <strong>Date:</strong> {event.eventDate}
                    </p>
                    <p className="mt-4">{event.description}</p>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Photos Gallery */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Event Photos ({photos.length})</h2>

              {photos.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No photos available for this event</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden group">
                      <div className="aspect-video relative bg-muted overflow-hidden">
                        <img
                          src={photo.fileData || "/placeholder.svg"}
                          alt={photo.fileName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <p className="text-sm font-medium truncate mb-2">{photo.fileName}</p>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(photo)} className="w-full">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Documents List */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Event Documents ({documents.length})</h2>

              {documents.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No documents available for this event</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-accent-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
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

                        <Button size="sm" onClick={() => handleDownload(doc)} className="gradient-primary">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download
                        </Button>
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
