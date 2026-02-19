"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db, type Event } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function CoordinatorDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState(auth.getCurrentUser())
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadType, setUploadType] = useState<"photo" | "document">("photo")
  const [isLoading, setIsLoading] = useState(true)
  const [totalFiles, setTotalFiles] = useState(0)
  const [eventFiles, setEventFiles] = useState<Record<string, any[]>>({})

  const [eventForm, setEventForm] = useState({
    year: new Date().getFullYear().toString(),
    coordinatorName: "",
    eventName: "",
    eventDate: "",
    numberOfDays: 1,
    description: "",
  })

  const years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"]

  useEffect(() => {
    if (!auth.isAuthenticated() || !auth.isCoordinator()) {
      router.push("/login")
      return
    }
    loadEvents()
  }, [router])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const allEvents = await db.getEvents()
      const allFiles = await db.getFiles()
      setEvents(allEvents)
      setFilteredEvents(allEvents)
      setTotalFiles(allFiles.length)

      // Load files for each event
      const filesMap: Record<string, any[]> = {}
      for (const event of allEvents) {
        filesMap[event.id] = await db.getFilesByEventId(event.id)
      }
      setEventFiles(filesMap)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedYear === "all") {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(events.filter((e) => e.year === selectedYear))
    }
  }, [selectedYear, events])

  const handleAddEvent = async () => {
    if (!eventForm.eventName || !eventForm.coordinatorName || !eventForm.eventDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      await db.createEvent({
        ...eventForm,
        createdBy: user?.id || "",
      })

      toast({
        title: "Success",
        description: "Event added successfully!",
      })

      setIsAddEventOpen(false)
      setEventForm({
        year: new Date().getFullYear().toString(),
        coordinatorName: "",
        eventName: "",
        eventDate: "",
        numberOfDays: 1,
        description: "",
      })
      loadEvents()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add event",
        variant: "destructive",
      })
    }
  }

  const handleEditEvent = async () => {
    if (!selectedEvent) return

    try {
      await db.updateEvent(selectedEvent.id, eventForm)

      toast({
        title: "Success",
        description: "Event updated successfully!",
      })

      setIsEditEventOpen(false)
      setSelectedEvent(null)
      loadEvents()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event? All associated files will also be deleted.")) {
      try {
        await db.deleteEvent(eventId)
        toast({
          title: "Success",
          description: "Event deleted successfully!",
        })
        loadEvents()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete event",
          variant: "destructive",
        })
      }
    }
  }

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event)
    setEventForm({
      year: event.year,
      coordinatorName: event.coordinatorName,
      eventName: event.eventName,
      eventDate: event.eventDate,
      numberOfDays: event.numberOfDays,
      description: event.description,
    })
    setIsEditEventOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEvent) return

    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "File size exceeds 10MB limit. Please choose a smaller file.",
        variant: "destructive",
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("eventId", selectedEvent.id)
      formData.append("fileType", uploadType)

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('currentUser') || ''}`
        }
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${uploadType === "photo" ? "Photo" : "Document"} uploaded successfully!`,
        })
        setIsUploadOpen(false)
        // Refresh the events or files data
        loadEvents()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: `Upload failed: ${errorData.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "An error occurred while uploading the file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openUploadDialog = (event: Event, type: "photo" | "document") => {
    setSelectedEvent(event)
    setUploadType(type)
    setIsUploadOpen(true)
  }

  const handleLogout = () => {
    auth.logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Coordinator Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="gradient-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-4xl font-bold">{events.length}</CardTitle>
              <CardDescription className="text-primary-foreground/80">Total Events</CardDescription>
            </CardHeader>
          </Card>

          <Card className="gradient-secondary text-secondary-foreground">
            <CardHeader>
              <CardTitle className="text-4xl font-bold">
                {
                  events.filter((e) => new Date(e.eventDate.split(" ")[0].split("-").reverse().join("-")) > new Date())
                    .length
                }
              </CardTitle>
              <CardDescription className="text-secondary-foreground/80">Upcoming Events</CardDescription>
            </CardHeader>
          </Card>

          <Card className="gradient-accent text-accent-foreground">
            <CardHeader>
              <CardTitle className="text-4xl font-bold">{totalFiles}</CardTitle>
              <CardDescription className="text-accent-foreground/80">Total Files</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="year-filter" className="text-sm font-medium whitespace-nowrap">
                Filter by Year:
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-filter" className="w-[200px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} events
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gradient-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>Fill in the event details below</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select
                      value={eventForm.year}
                      onValueChange={(value) => setEventForm({ ...eventForm, year: value })}
                    >
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfDays">Number of Days</Label>
                    <Input
                      id="numberOfDays"
                      type="number"
                      min="1"
                      value={eventForm.numberOfDays}
                      onChange={(e) => setEventForm({ ...eventForm, numberOfDays: Number.parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="coordinatorName">Coordinator Name</Label>
                    <Input
                      id="coordinatorName"
                      placeholder="Prof. John Doe"
                      value={eventForm.coordinatorName}
                      onChange={(e) => setEventForm({ ...eventForm, coordinatorName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="eventName">Event Name</Label>
                    <Input
                      id="eventName"
                      placeholder="Workshop on AI"
                      value={eventForm.eventName}
                      onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="eventDate">Event Date</Label>
                    <Input
                      id="eventDate"
                      placeholder="01-01-2025 to 03-01-2025"
                      value={eventForm.eventDate}
                      onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Event description..."
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>

                <Button onClick={handleAddEvent} className="w-full gradient-primary">
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            {selectedYear === "all" ? "All Events" : `Events from ${selectedYear}`}
          </h2>

          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {selectedYear === "all"
                    ? "No events found. Add your first event to get started!"
                    : `No events found for ${selectedYear}`}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{event.eventName}</CardTitle>
                      <CardDescription className="mt-2">
                        <div className="space-y-1">
                          <p>
                            <strong>Year:</strong> {event.year}
                          </p>
                          <p>
                            <strong>Coordinator:</strong> {event.coordinatorName}
                          </p>
                          <p>
                            <strong>Date:</strong> {event.eventDate}
                          </p>
                          <p>
                            <strong>Duration:</strong> {event.numberOfDays} day(s)
                          </p>
                        </div>
                      </CardDescription>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{event.description}</p>

                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" className="gradient-secondary" onClick={() => openUploadDialog(event, "photo")}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Upload Photo
                    </Button>

                    <Button size="sm" className="gradient-accent" onClick={() => openUploadDialog(event, "document")}>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      Upload Document
                    </Button>

                    <Button size="sm" variant="outline" onClick={() => router.push(`/coordinator/files/${event.id}`)}>
                      View Files ({(eventFiles[event.id] || []).length})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update the event details below</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year</Label>
                <Select value={eventForm.year} onValueChange={(value) => setEventForm({ ...eventForm, year: value })}>
                  <SelectTrigger id="edit-year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-numberOfDays">Number of Days</Label>
                <Input
                  id="edit-numberOfDays"
                  type="number"
                  min="1"
                  value={eventForm.numberOfDays}
                  onChange={(e) => setEventForm({ ...eventForm, numberOfDays: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-coordinatorName">Coordinator Name</Label>
                <Input
                  id="edit-coordinatorName"
                  value={eventForm.coordinatorName}
                  onChange={(e) => setEventForm({ ...eventForm, coordinatorName: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-eventName">Event Name</Label>
                <Input
                  id="edit-eventName"
                  value={eventForm.eventName}
                  onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-eventDate">Event Date</Label>
                <Input
                  id="edit-eventDate"
                  value={eventForm.eventDate}
                  onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <Button onClick={handleEditEvent} className="w-full gradient-primary">
              Update Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {uploadType === "photo" ? "Photo" : "Document"}</DialogTitle>
            <DialogDescription>
              Select a {uploadType === "photo" ? "photo" : "document"} to upload for this event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Input
                type="file"
                accept={uploadType === "photo" ? "image/*" : ".pdf,.doc,.docx,.txt"}
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {uploadType === "photo" ? "Supported: JPG, PNG, GIF" : "Supported: PDF, DOC, DOCX, TXT"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
