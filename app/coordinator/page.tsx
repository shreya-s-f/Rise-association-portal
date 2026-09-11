"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth, db, type EventWithFiles, type UploadedFile } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar,
  ShieldCheck,
  Plus,
  Upload,
  FileText,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Search,
  Layers,
  Sparkles,
  LogOut,
  X,
  CheckCircle2,
  FolderOpen,
} from "lucide-react"

export default function CoordinatorDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState(auth.getCurrentUser())
  const [events, setEvents] = useState<EventWithFiles[]>([])
  const [filteredEvents, setFilteredEvents] = useState<EventWithFiles[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  // Dialog states
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isEditEventOpen, setIsEditEventOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  const [selectedEvent, setSelectedEvent] = useState<EventWithFiles | null>(null)
  const [uploadType, setUploadType] = useState<"photo" | "document">("photo")
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [eventForm, setEventForm] = useState({
    year: "2025",
    coordinatorName: "",
    eventName: "",
    eventDate: "",
    numberOfDays: 1,
    description: "",
  })

  const years = ["all", "2025", "2024", "2023", "2022", "2021"]

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
      const data = await db.getEventsWithFiles()
      setEvents(data)
      setFilteredEvents(data)
    } catch (error) {
      console.error("Failed to load coordinator events:", error)
      toast({
        title: "Load Error",
        description: "Could not fetch events list.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let list = events

    if (selectedYear !== "all") {
      list = list.filter((e) => e.year === selectedYear)
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(
        (e) =>
          e.eventName.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.coordinatorName.toLowerCase().includes(q)
      )
    }

    setFilteredEvents(list)
  }, [searchTerm, selectedYear, events])

  const handleAddEvent = async () => {
    if (!eventForm.eventName.trim() || !eventForm.coordinatorName.trim() || !eventForm.eventDate.trim()) {
      toast({
        title: "Required Fields",
        description: "Please provide Event Name, Coordinators, and Date.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      await db.createEvent({
        ...eventForm,
        createdBy: user?.id || "coordinator",
      })

      toast({
        title: "Event Created!",
        description: `"${eventForm.eventName}" added to RISE portal.`,
      })

      setIsAddEventOpen(false)
      setEventForm({
        year: "2025",
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
        description: error.message || "Failed to create event",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditEvent = async () => {
    if (!selectedEvent) return

    try {
      setIsSubmitting(true)
      await db.updateEvent(selectedEvent.id, eventForm)

      toast({
        title: "Event Updated!",
        description: "Changes saved successfully.",
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return

    try {
      await db.deleteEvent(eventToDelete)
      toast({
        title: "Event Deleted",
        description: "Event and associated records removed.",
      })
      setIsDeleteConfirmOpen(false)
      setEventToDelete(null)
      loadEvents()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (event: EventWithFiles) => {
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

  const handleFileUpload = async () => {
    if (!selectedEvent || !selectedUploadFile) return

    try {
      setIsSubmitting(true)
      await db.uploadFile(selectedUploadFile, selectedEvent.id, uploadType)

      toast({
        title: "Upload Successful!",
        description: `${selectedUploadFile.name} uploaded as ${uploadType}.`,
      })

      setIsUploadOpen(false)
      setSelectedUploadFile(null)
      loadEvents()
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Could not upload file.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openUploadDialog = (event: EventWithFiles, type: "photo" | "document") => {
    setSelectedEvent(event)
    setUploadType(type)
    setSelectedUploadFile(null)
    setIsUploadOpen(true)
  }

  const handleLogout = () => {
    auth.logout()
    router.push("/")
  }

  const totalPhotos = events.reduce(
    (acc, e) => acc + (e.files?.filter((f) => f.fileType === "photo").length || 0),
    0
  )
  const totalDocs = events.reduce(
    (acc, e) => acc + (e.files?.filter((f) => f.fileType === "document").length || 0),
    0
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background glow ambiance */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-white text-base shadow-md group-hover:scale-105 transition-transform">
                BEC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base tracking-tight">
                    RISE Association
                  </span>
                  <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-[10px]">
                    Coordinator
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Department of Information Science & Engineering
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{user?.name || "Coordinator"}</span>
            </div>

            <Button
              size="sm"
              onClick={() => setIsAddEventOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-md"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Event
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-700 bg-slate-900/50 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 text-left">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{events.length}</div>
            <div className="text-xs text-slate-400 font-medium">Total Events Recorded</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 text-left">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalPhotos}</div>
            <div className="text-xs text-slate-400 font-medium">Event Photos Stored</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 text-left">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalDocs}</div>
            <div className="text-xs text-slate-400 font-medium">Reports & Documents</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 text-left">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {new Set(events.map((e) => e.year)).size}
            </div>
            <div className="text-xs text-slate-400 font-medium">Academic Years Active</div>
          </div>
        </div>

        {/* Controls and Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search events, coordinators, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-500 text-sm focus-visible:ring-cyan-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Year Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">
                Year:
              </span>
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedYear === y
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {y === "all" ? "All Years" : y}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/40 text-center py-16">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No events found</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                No events match your current filter. Add a new event or reset filters.
              </p>
              <Button
                size="sm"
                onClick={() => setIsAddEventOpen(true)}
                className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const photos = event.files?.filter((f) => f.fileType === "photo") || []
              const docs = event.files?.filter((f) => f.fileType === "document") || []

              return (
                <Card
                  key={event.id}
                  className="bg-slate-900/60 border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 shadow-lg"
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Event Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold">
                            {event.year}
                          </Badge>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                            {event.eventDate}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {event.numberOfDays} day{event.numberOfDays !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {event.eventName}
                        </h3>

                        <p className="text-xs text-slate-400 font-medium">
                          Coordinators: <span className="text-slate-300">{event.coordinatorName}</span>
                        </p>

                        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 pt-1 leading-relaxed">
                          {event.description}
                        </p>

                        {/* File Attachment Counts */}
                        <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                            {photos.length} Photo{photos.length !== 1 ? "s" : ""}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-blue-400" />
                            {docs.length} Document{docs.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUploadDialog(event, "photo")}
                            className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs"
                          >
                            <ImageIcon className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                            + Photo
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUploadDialog(event, "document")}
                            className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1 text-blue-400" />
                            + Doc
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/coordinator/files/${event.id}`)}
                            className="border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs"
                          >
                            <FolderOpen className="w-3.5 h-3.5 mr-1" />
                            Files ({photos.length + docs.length})
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(event)}
                            className="text-slate-300 hover:text-white hover:bg-slate-800 p-2 h-auto"
                            title="Edit Event"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEventToDelete(event.id)
                              setIsDeleteConfirmOpen(true)
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-auto"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Add New Event</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Enter the details of the event or workshop to add to RISE archives
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="year" className="text-xs text-slate-300">
                  Academic Year *
                </Label>
                <Select
                  value={eventForm.year}
                  onValueChange={(val) => setEventForm({ ...eventForm, year: val })}
                >
                  <SelectTrigger id="year" className="bg-slate-950/60 border-slate-700 text-white text-sm">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    {["2025", "2024", "2023", "2022", "2021"].map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="numberOfDays" className="text-xs text-slate-300">
                  Duration (Days) *
                </Label>
                <Input
                  id="numberOfDays"
                  type="number"
                  min="1"
                  value={eventForm.numberOfDays}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, numberOfDays: parseInt(e.target.value) || 1 })
                  }
                  className="bg-slate-950/60 border-slate-700 text-white text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="coordinatorName" className="text-xs text-slate-300">
                  Coordinator Name(s) *
                </Label>
                <Input
                  id="coordinatorName"
                  placeholder="e.g. Prof. G.B. Shettar and Prof. S.N. Kugli"
                  value={eventForm.coordinatorName}
                  onChange={(e) => setEventForm({ ...eventForm, coordinatorName: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="eventName" className="text-xs text-slate-300">
                  Event Title *
                </Label>
                <Input
                  id="eventName"
                  placeholder="e.g. 3-Day Hands-on Workshop on Generative AI"
                  value={eventForm.eventName}
                  onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="eventDate" className="text-xs text-slate-300">
                  Event Date / Date Range *
                </Label>
                <Input
                  id="eventDate"
                  placeholder="e.g. 15-10-2025 or 15-10-2025 to 17-10-2025"
                  value={eventForm.eventDate}
                  onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description" className="text-xs text-slate-300">
                  Description & Key Highlights
                </Label>
                <Textarea
                  id="description"
                  placeholder="Detailed agenda, resource persons, target participants, student response..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={4}
                  className="bg-slate-950/60 border-slate-700 text-white text-sm resize-none"
                />
              </div>
            </div>

            <Button
              onClick={handleAddEvent}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-5 shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? "Creating Event..." : "Publish Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit Event Details</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Update information for this event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-year" className="text-xs text-slate-300">
                  Year
                </Label>
                <Select
                  value={eventForm.year}
                  onValueChange={(val) => setEventForm({ ...eventForm, year: val })}
                >
                  <SelectTrigger id="edit-year" className="bg-slate-950/60 border-slate-700 text-white text-sm">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    {["2025", "2024", "2023", "2022", "2021"].map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-duration" className="text-xs text-slate-300">
                  Duration (Days)
                </Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="1"
                  value={eventForm.numberOfDays}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, numberOfDays: parseInt(e.target.value) || 1 })
                  }
                  className="bg-slate-950/60 border-slate-700 text-white text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-coordinator" className="text-xs text-slate-300">
                  Coordinators
                </Label>
                <Input
                  id="edit-coordinator"
                  value={eventForm.coordinatorName}
                  onChange={(e) => setEventForm({ ...eventForm, coordinatorName: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-name" className="text-xs text-slate-300">
                  Event Name
                </Label>
                <Input
                  id="edit-name"
                  value={eventForm.eventName}
                  onChange={(e) => setEventForm({ ...eventForm, eventName: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-date" className="text-xs text-slate-300">
                  Date
                </Label>
                <Input
                  id="edit-date"
                  value={eventForm.eventDate}
                  onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white text-sm"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-desc" className="text-xs text-slate-300">
                  Description
                </Label>
                <Textarea
                  id="edit-desc"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={4}
                  className="bg-slate-950/60 border-slate-700 text-white text-sm resize-none"
                />
              </div>
            </div>

            <Button
              onClick={handleEditEvent}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-5 shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              {uploadType === "photo" ? (
                <ImageIcon className="w-5 h-5 text-cyan-400" />
              ) : (
                <FileText className="w-5 h-5 text-blue-400" />
              )}
              Upload {uploadType === "photo" ? "Event Photo" : "Event Document"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Attach a {uploadType} to "{selectedEvent?.eventName}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 text-center transition-colors bg-slate-950/50">
              <input
                type="file"
                id="file-upload-input"
                accept={uploadType === "photo" ? "image/*" : ".pdf,.doc,.docx,.txt"}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedUploadFile(e.target.files[0])
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="file-upload-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-white">
                  {selectedUploadFile ? selectedUploadFile.name : "Click to select a file"}
                </span>
                <span className="text-xs text-slate-500">
                  {uploadType === "photo"
                    ? "PNG, JPG, JPEG, WEBP up to 15MB"
                    : "PDF, Word, or Text reports up to 15MB"}
                </span>
              </label>
            </div>

            <Button
              onClick={handleFileUpload}
              disabled={!selectedUploadFile || isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-5 shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? "Uploading..." : `Upload ${uploadType === "photo" ? "Photo" : "Document"}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Are you sure you want to delete this event? All associated photos and reports will also be removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-3 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteEvent}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
