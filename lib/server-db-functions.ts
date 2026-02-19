import { fileStorage } from "./server-db"

export interface User {
  id: string
  name: string
  email: string
  password: string
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
  fileData: string // Now stores file path instead of base64
  uploadedBy: string
  uploadedAt: string
}

// Database helper functions
export const db = {
  // Users
  getUsers: (): User[] => {
    const users = fileStorage.getItem("users")
    return users ? JSON.parse(users) : []
  },

  saveUsers: (users: User[]) => {
    fileStorage.setItem("users", JSON.stringify(users))
  },

  getUserByEmail: (email: string): User | undefined => {
    const users = db.getUsers()
    return users.find((u) => u.email === email)
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
    fileStorage.setItem("events", JSON.stringify(events))
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

    // Also delete associated files
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
    fileStorage.setItem("files", JSON.stringify(files))
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

// Auth helper functions
export const auth = {
  getCurrentUser: (): User | null => {
    try {
      const userStr = fileStorage.getItem("currentUser")
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  },

  setCurrentUser: (user: User | null) => {
    try {
      if (user) {
        fileStorage.setItem("currentUser", JSON.stringify(user))
      } else {
        fileStorage.removeItem("currentUser")
      }
    } catch {
      // noop on server
    }
  },

  login: (email: string, password: string): User | null => {
    const user = db.getUserByEmail(email)
    if (user && user.password === password) {
      auth.setCurrentUser(user)
      return user
    }
    return null
  },

  logout: () => {
    auth.setCurrentUser(null)
  },

  isAuthenticated: (): boolean => {
    return auth.getCurrentUser() !== null
  },

  isCoordinator: (): boolean => {
    const user = auth.getCurrentUser()
    return user?.role === "coordinator"
  },
}

// Initialize with sample data
export const initializeDatabase = () => {
  const events = db.getEvents()
  if (events.length === 0) {
    // Add sample events
    const sampleEvents = [
      {
        year: "2024",
        coordinatorName: "Prof.P.V.Kulkarni and Prof.P.R.Muttannavar",
        eventName: "A 3-Day Workshop on IoT-Based Application Development",
        eventDate: "04-12-2024 to 06-12-2024",
        numberOfDays: 3,
        description: "Comprehensive hands-on workshop covering IoT fundamentals and practical applications",
        createdBy: "system",
      },
      {
        year: "2025",
        coordinatorName: "Prof.G.B.Shettar and Prof.S.S.Hiremath",
        eventName: "Tech Symposium",
        eventDate: "15-09-2025 to 17-09-2025",
        numberOfDays: 3,
        description: "Annual technical symposium featuring latest technology trends",
        createdBy: "system",
      },
    ]

    sampleEvents.forEach((event) => db.createEvent(event))
  }
}