import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { FileUpload } from "./file-upload"
import { FileDisplay } from "./file-display"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"
import { Badge } from "./badge"

interface YearFilesProps {
  year: string
  onUpdate?: () => void
}

interface EventWithFiles {
  event: {
    id: string
    eventName: string
    coordinatorName: string
    eventDate: string
  }
  files: Array<{
    id: string
    fileName: string
    fileType: "photo" | "document"
    fileData: string
    uploadedAt: string
  }>
}

export function YearFiles({ year, onUpdate }: YearFilesProps) {
  const [eventsWithFiles, setEventsWithFiles] = useState<EventWithFiles[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/files?year=${year}`)
      if (response.ok) {
        const data = await response.json()
        setEventsWithFiles(data)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [year])

  const handleFileUpdate = () => {
    fetchFiles()
    if (onUpdate) onUpdate()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading files...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-1">
            {year}
          </Badge>
          <span>Year Files</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Upload files for this year:</p>
          <FileUpload
            eventId={eventsWithFiles.length > 0 ? eventsWithFiles[0].event.id : ""}
            onUpload={handleFileUpdate}
          />
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {eventsWithFiles.map(({ event, files }) => (
            <AccordionItem key={event.id} value={event.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-col items-start text-left">
                  <div className="font-medium">{event.eventName}</div>
                  <div className="text-sm text-muted-foreground">
                    {event.coordinatorName} • {event.eventDate}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  {files.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No files for this event</p>
                  ) : (
                    <FileDisplay files={files} onDelete={handleFileUpdate} />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}