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
  fileData: string
  uploadedBy: string
  uploadedAt: string
}

export interface EventWithFiles extends Event {
  files: UploadedFile[]
}

// Safe storage abstraction
const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined"

const storage = isBrowser
  ? {
      getItem: (k: string) => localStorage.getItem(k),
      setItem: (k: string, v: string) => localStorage.setItem(k, v),
      removeItem: (k: string) => localStorage.removeItem(k),
    }
  : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }

// Auth helper functions
export const auth = {
  getCurrentUser: (): User | null => {
    try {
      const userStr = storage.getItem("currentUser")
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
    }
  },

  getAuthHeader: (): Record<string, string> => {
    const user = auth.getCurrentUser()
    if (!user) return {}
    return {
      Authorization: `Bearer ${JSON.stringify(user)}`,
    }
  },

  setCurrentUser: (user: User | null) => {
    try {
      if (user) {
        storage.setItem("currentUser", JSON.stringify(user))
      } else {
        storage.removeItem("currentUser")
      }
    } catch {
      // noop
    }
  },

  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        return null
      }

      const user = await response.json()
      auth.setCurrentUser(user)
      return user
    } catch (error) {
      console.error("Login error:", error)
      return null
    }
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

// Client-side database functions
export const db = {
  // Events
  getEvents: async (year?: string): Promise<Event[]> => {
    const query = year && year !== "all" ? `?year=${encodeURIComponent(year)}` : ""
    const response = await fetch(`/api/events${query}`, {
      headers: auth.getAuthHeader(),
    })
    if (!response.ok) throw new Error("Failed to fetch events")
    return response.json()
  },

  getEventsWithFiles: async (year?: string): Promise<EventWithFiles[]> => {
    const yearParam = year && year !== "all" ? `&year=${encodeURIComponent(year)}` : ""
    const response = await fetch(`/api/events?includeFiles=true${yearParam}`, {
      headers: auth.getAuthHeader(),
    })
    if (!response.ok) throw new Error("Failed to fetch events with files")
    return response.json()
  },

  createEvent: async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<Event> => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...auth.getAuthHeader(),
      },
      body: JSON.stringify(eventData),
    })
    if (!response.ok) throw new Error("Failed to create event")
    return response.json()
  },

  updateEvent: async (eventId: string, eventData: Partial<Event>): Promise<Event> => {
    const response = await fetch("/api/events", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...auth.getAuthHeader(),
      },
      body: JSON.stringify({ eventId, eventData }),
    })
    if (!response.ok) throw new Error("Failed to update event")
    return response.json()
  },

  deleteEvent: async (eventId: string): Promise<boolean> => {
    const response = await fetch("/api/events", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...auth.getAuthHeader(),
      },
      body: JSON.stringify({ eventId }),
    })
    if (!response.ok) throw new Error("Failed to delete event")
    return true
  },

  // Files
  getFiles: async (year?: string): Promise<UploadedFile[]> => {
    const query = year && year !== "all" ? `?year=${encodeURIComponent(year)}` : ""
    const response = await fetch(`/api/files${query}`, {
      headers: auth.getAuthHeader(),
    })
    if (!response.ok) throw new Error("Failed to fetch files")
    const data = await response.json()
    if (Array.isArray(data)) {
      if (data.length > 0 && data[0].files) {
        return data.flatMap((item: any) => item.files)
      }
      return data
    }
    return []
  },

  getFilesByEventId: async (eventId: string): Promise<UploadedFile[]> => {
    const response = await fetch(`/api/files?eventId=${encodeURIComponent(eventId)}`, {
      headers: auth.getAuthHeader(),
    })
    if (!response.ok) throw new Error("Failed to fetch files for event")
    return response.json()
  },

  uploadFile: async (file: File, eventId: string, fileType: "photo" | "document"): Promise<UploadedFile> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("eventId", eventId)
    formData.append("fileType", fileType)

    const response = await fetch("/api/files", {
      method: "POST",
      headers: auth.getAuthHeader(),
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || "Failed to upload file")
    }

    return response.json()
  },

  deleteFile: async (fileId: string): Promise<boolean> => {
    const response = await fetch("/api/files", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...auth.getAuthHeader(),
      },
      body: JSON.stringify({ fileId }),
    })
    if (!response.ok) throw new Error("Failed to delete file")
    return true
  },

  // Users
  createUser: async (userData: Omit<User, "id" | "createdAt">): Promise<User> => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || "Failed to create user")
    }
    return response.json()
  },
}
