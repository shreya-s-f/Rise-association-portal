import { fileStorage } from "./server-db"

export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: "coordinator" | "student"
  address: string
  dateOfBirth: string
  yearOfStudying?: string
  department?: string
  phoneNumber?: string
  createdAt: string
}

export interface Event {
  id: string
  year: string
  coordinatorName: string
  eventName: string
  eventDate: string
  numberOfDays: number
  description: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface UploadedFile {
  id: string
  eventId: string
  year: string
  fileName: string
  fileType: "photo" | "document"
  fileData: string // stores file path, e.g. /uploads/filename.ext
  uploadedBy: string
  uploadedAt: string
}

export interface EventWithFiles extends Event {
  files: UploadedFile[]
}

// Database helper functions
export const db = {
  // Users
  getUsers: (): User[] => {
    const users = fileStorage.getItem("users")
    return users ? JSON.parse(users) : []
  },

  saveUsers: (users: User[]) => {
    fileStorage.setItem("users", JSON.stringify(users, null, 2))
  },

  getUserByEmail: (email: string): User | undefined => {
    const users = db.getUsers()
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  },

  getUserById: (id: string): User | undefined => {
    const users = db.getUsers()
    return users.find((u) => u.id === id)
  },

  createUser: (user: Omit<User, "id" | "createdAt">): User => {
    const users = db.getUsers()
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    db.saveUsers(users)
    return newUser
  },

  // Events
  getEvents: (): Event[] => {
    const events = fileStorage.getItem("events")
    return events ? JSON.parse(events) : []
  },

  saveEvents: (events: Event[]) => {
    fileStorage.setItem("events", JSON.stringify(events, null, 2))
  },

  getEventsWithFiles: (): EventWithFiles[] => {
    const events = db.getEvents()
    const files = db.getFiles()
    
    // Group files by eventId in O(N) time
    const filesByEvent: Record<string, UploadedFile[]> = {}
    for (const file of files) {
      if (!filesByEvent[file.eventId]) {
        filesByEvent[file.eventId] = []
      }
      filesByEvent[file.eventId].push(file)
    }

    return events.map(event => ({
      ...event,
      files: filesByEvent[event.id] || []
    }))
  },

  createEvent: (event: Omit<Event, "id" | "createdAt" | "updatedAt">): Event => {
    const events = db.getEvents()
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    events.push(newEvent)
    db.saveEvents(events)
    return newEvent
  },

  updateEvent: (id: string, updates: Partial<Event>): Event | null => {
    const events = db.getEvents()
    const index = events.findIndex((e) => e.id === id)
    if (index === -1) return null

    events[index] = {
      ...events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    db.saveEvents(events)
    return events[index]
  },

  deleteEvent: (id: string): boolean => {
    const events = db.getEvents()
    const filtered = events.filter((e) => e.id !== id)
    if (filtered.length === events.length) return false
    db.saveEvents(filtered)

    // Also delete associated files metadata
    const files = db.getFiles()
    const filteredFiles = files.filter((f) => f.eventId !== id)
    db.saveFiles(filteredFiles)

    return true
  },

  // Files
  getFiles: (): UploadedFile[] => {
    const files = fileStorage.getItem("files")
    return files ? JSON.parse(files) : []
  },

  saveFiles: (files: UploadedFile[]) => {
    fileStorage.setItem("files", JSON.stringify(files, null, 2))
  },

  getFilesByYear: (year: string): UploadedFile[] => {
    const files = db.getFiles()
    return files.filter((f) => f.year === year)
  },

  getEventsByYear: (year: string): Event[] => {
    const events = db.getEvents()
    return events.filter((e) => e.year === year)
  },

  getFilesByEventId: (eventId: string): UploadedFile[] => {
    const files = db.getFiles()
    return files.filter((f) => f.eventId === eventId)
  },

  createFile: (file: Omit<UploadedFile, "id" | "uploadedAt" | "year">): UploadedFile => {
    const files = db.getFiles()
    const event = db.getEvents().find(e => e.id === file.eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    const newFile: UploadedFile = {
      ...file,
      year: event.year,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
    }
    files.push(newFile)
    db.saveFiles(files)
    return newFile
  },

  deleteFile: (id: string): boolean => {
    const files = db.getFiles()
    const filtered = files.filter((f) => f.id !== id)
    if (filtered.length === files.length) return false
    db.saveFiles(filtered)
    return true
  },
}

// Stateless Auth helper functions
export const auth = {
  getUserFromAuthHeader: (authHeader: string | null): User | null => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const raw = authHeader.substring(7).trim()
    if (!raw) return null

    try {
      // First try JSON parse if client sends serialized user
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === "object") {
        if (parsed.email) {
          const user = db.getUserByEmail(parsed.email)
          if (user) return user
        }
        if (parsed.id) {
          const user = db.getUserById(parsed.id)
          if (user) return user
        }
        // Fallback to parsed object if fields present
        if (parsed.id && parsed.role) {
          return parsed as User
        }
      }
    } catch {
      // Try treating raw as ID or email directly
      const byEmail = db.getUserByEmail(raw)
      if (byEmail) return byEmail
      const byId = db.getUserById(raw)
      if (byId) return byId
    }

    return null
  },

  login: (email: string, password: string): User | null => {
    const user = db.getUserByEmail(email)
    if (user && user.password === password) {
      // Strip password from returned object
      const { password: _, ...sanitizedUser } = user
      return sanitizedUser as User
    }
    return null
  },

  isAuthenticated: (user: User | null): boolean => {
    return user !== null
  },

  isCoordinator: (user: User | null): boolean => {
    return user?.role === "coordinator"
  },
}

// Initialize with sample data if empty
export const initializeDatabase = () => {
  // Ensure default demo users exist
  const users = db.getUsers()
  if (users.length === 0) {
    const defaultUsers: User[] = [
      {
        id: "1767726249315",
        name: "Prof. Ranjita",
        email: "ranjita@gmail.com",
        password: "ranjita123",
        role: "coordinator",
        address: "Basaveshwar Nagar, Bagalkot",
        dateOfBirth: "1990-05-15",
        department: "Information Science and Engineering",
        phoneNumber: "+91 97439 94840",
        createdAt: "2026-01-06T19:04:09.315Z",
      },
      {
        id: "1767736572431",
        name: "Mala (Student)",
        email: "mala123@gmail.com",
        password: "mala123",
        role: "student",
        address: "Bagalkot, Karnataka",
        dateOfBirth: "2006-01-14",
        yearOfStudying: "3",
        department: "Information Science and Engineering",
        phoneNumber: "+91 92373 82648",
        createdAt: "2026-01-06T21:56:12.431Z",
      }
    ]
    db.saveUsers(defaultUsers)
  }

  // Ensure sample events exist if empty
  const events = db.getEvents()
  if (events.length === 0) {
    const sampleEvents = [
      {
        year: "2025",
        coordinatorName: "Prof. G.B. Shettar & Prof. S.N. Kugli",
        eventName: "INCEPTA 2025 - Technical Symposium",
        eventDate: "15-10-2025",
        numberOfDays: 1,
        description: "RISE Association conducted INCEPTA 2025 consisting of Code Quest, Decode X, and Technical Quiz. Over 60 participants from 3rd semester ISE attended.",
        createdBy: "system",
      },
      {
        year: "2024",
        coordinatorName: "Prof. P.V. Kulkarni & Prof. P.R. Muttannavar",
        eventName: "3-Day Workshop on Accelerated AI & Machine Learning",
        eventDate: "04-03-2024 to 06-03-2024",
        numberOfDays: 3,
        description: "Organized in association with IDEA Lab. Hands-on training on modern deep learning models, LLMs, and Python ML pipelines.",
        createdBy: "system",
      },
    ]

    sampleEvents.forEach((event) => db.createEvent(event))
  }
}