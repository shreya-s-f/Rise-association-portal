"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db, type Event } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(auth.getCurrentUser())
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [totalFiles, setTotalFiles] = useState(0)
  const [eventFiles, setEventFiles] = useState<Record<string, any[]>>({})

  const years = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"]

  useEffect(() => {
    if (!auth.isAuthenticated()) {
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
    let filtered = events

    // Filter by year
    if (selectedYear !== "all") {
      filtered = filtered.filter((e) => e.year === selectedYear)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.coordinatorName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredEvents(filtered)
  }, [searchTerm, selectedYear, events])

  const handleLogout = () => {
    auth.logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className="mb-8 gradient-primary text-primary-foreground">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">RISE Initiative Events</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Information Science and Engineering Department
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center gap-8 flex-wrap">
              <div>
                <div className="text-4xl font-bold">{events.length}</div>
                <div className="text-sm opacity-80">Total Events</div>
              </div>
              <div>
                <div className="text-4xl font-bold">{years.length}</div>
                <div className="text-sm opacity-80">Academic Years</div>
              </div>
              <div>
                <div className="text-4xl font-bold">{totalFiles}</div>
                <div className="text-sm opacity-80">Resources</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search events by name, description, or coordinator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="student-year-filter" className="text-sm font-medium whitespace-nowrap">
                  Year:
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="student-year-filter" className="w-[180px]">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">
            Events {selectedYear !== "all" && `(${selectedYear})`}
            <span className="text-muted-foreground text-lg ml-2">({filteredEvents.length})</span>
          </h2>

          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No events found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => {
                const eventFilesList = eventFiles[event.id] || []
                const photos = eventFilesList.filter((f) => f.fileType === "photo")
                const documents = eventFilesList.filter((f) => f.fileType === "document")

                return (
                  <Card key={event.id} className="hover:shadow-lg transition-all hover:scale-[1.01]">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="gradient-primary">{event.year}</Badge>
                            <Badge variant="outline">{event.numberOfDays} day(s)</Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{event.eventName}</CardTitle>
                          <CardDescription>
                            <div className="space-y-1">
                              <p>
                                <strong>Coordinator:</strong> {event.coordinatorName}
                              </p>
                              <p>
                                <strong>Date:</strong> {event.eventDate}
                              </p>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{event.description}</p>

                      {eventFiles.length > 0 && (
                        <div className="flex gap-2 items-center text-sm text-muted-foreground mb-4">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {photos.length} photo(s), {documents.length} document(s)
                          </span>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full md:w-auto bg-transparent"
                        onClick={() => router.push(`/student/event/${event.id}`)}
                      >
                        View Details & Files
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
