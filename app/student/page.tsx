"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth, db, type EventWithFiles, type UploadedFile } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar,
  Users,
  Search,
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  ArrowRight,
  LogOut,
  GraduationCap,
  Sparkles,
  Layers,
  X,
} from "lucide-react"

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(auth.getCurrentUser())
  const [events, setEvents] = useState<EventWithFiles[]>([])
  const [filteredEvents, setFilteredEvents] = useState<EventWithFiles[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [activeModalEvent, setActiveModalEvent] = useState<EventWithFiles | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const years = ["all", "2025", "2024", "2023", "2022", "2021"]

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push("/login")
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const data = await db.getEventsWithFiles()
      setEvents(data)
      setFilteredEvents(data)
    } catch (error) {
      console.error("Failed to load events:", error)
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
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px]">
                    Student View
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Department of Information Science & Engineering
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>{user?.name || "Student"}</span>
            </div>

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
        {/* Banner Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900/70 to-indigo-950/60 border border-slate-800 backdrop-blur-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold mb-2">
                <Sparkles className="w-4 h-4" />
                <span>STUDENT PORTAL ARCHIVES</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Departmental Events & Media
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-xl">
                Browse workshop archives, access event documentation, certificates, and photo galleries from all academic years.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xl sm:text-2xl font-bold text-cyan-400">{events.length}</div>
                <div className="text-[11px] text-slate-400 font-medium">Events</div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xl sm:text-2xl font-bold text-blue-400">{totalPhotos}</div>
                <div className="text-[11px] text-slate-400 font-medium">Photos</div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div className="text-xl sm:text-2xl font-bold text-indigo-400">{totalDocs}</div>
                <div className="text-[11px] text-slate-400 font-medium">Documents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search event name, topic, or coordinator..."
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

            {/* Year Filters as Glowing Pills */}
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

        {/* Event Cards Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/40 text-center py-16">
            <CardContent className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">No events match your criteria</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Try searching for a different keyword or select "All Years".
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedYear("all")
                }}
                className="border-slate-700 bg-slate-800 text-slate-300"
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const photos = event.files?.filter((f) => f.fileType === "photo") || []
              const docs = event.files?.filter((f) => f.fileType === "document") || []

              return (
                <Card
                  key={event.id}
                  className="bg-slate-900/60 border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group shadow-lg"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold">
                        {event.year}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        {event.eventDate}
                      </span>
                    </div>

                    <CardTitle className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                      {event.eventName}
                    </CardTitle>

                    <CardDescription className="text-xs text-slate-400 line-clamp-1 mt-1">
                      Coordinator: {event.coordinatorName}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    {/* File Attachment Badges */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
                      <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800">
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        {photos.length} Photo{photos.length !== 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-950/60 px-2 py-1 rounded-md border border-slate-800">
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        {docs.length} Doc{docs.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveModalEvent(event)}
                        className="flex-1 border-slate-700 bg-slate-800/60 text-slate-200 hover:text-white hover:bg-slate-800 text-xs"
                      >
                        Quick View ({photos.length + docs.length})
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => router.push(`/student/event/${event.id}`)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs px-3 shadow-md"
                      >
                        Details
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Quick View Dialog Modal */}
      {activeModalEvent && (
        <Dialog open={!!activeModalEvent} onOpenChange={(open) => !open && setActiveModalEvent(null)}>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs">
                  {activeModalEvent.year}
                </Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  {activeModalEvent.eventDate}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold text-white">
                {activeModalEvent.eventName}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Coordinators: {activeModalEvent.coordinatorName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                {activeModalEvent.description}
              </p>

              {/* Photos Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  Photos ({activeModalEvent.files?.filter((f) => f.fileType === "photo").length || 0})
                </h4>

                {activeModalEvent.files?.filter((f) => f.fileType === "photo").length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No photos uploaded for this event.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {activeModalEvent.files
                      ?.filter((f) => f.fileType === "photo")
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setLightboxImage(p.fileData)}
                          className="group relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer hover:border-cyan-500/50 transition-all"
                        >
                          <img
                            src={p.fileData}
                            alt={p.fileName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] text-white truncate">{p.fileName}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Documents List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" />
                  Documents & Reports (
                  {activeModalEvent.files?.filter((f) => f.fileType === "document").length || 0})
                </h4>

                {activeModalEvent.files?.filter((f) => f.fileType === "document").length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No documents uploaded for this event.</p>
                ) : (
                  <div className="space-y-2">
                    {activeModalEvent.files
                      ?.filter((f) => f.fileType === "document")
                      .map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate max-w-md">
                            <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                            <span className="text-slate-200 truncate">{d.fileName}</span>
                          </div>
                          <a
                            href={d.fileData}
                            download={d.fileName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in-up"
        >
          <div className="relative max-w-4xl w-full flex items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged preview"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain border border-slate-800"
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500">
        Basaveshwar Engineering College, Bagalkot • Department of Information Science & Engineering
      </footer>
    </div>
  )
}
