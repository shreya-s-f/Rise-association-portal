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
  fileData: string
  uploadedBy: string
  uploadedAt: string
}

// Safe storage abstraction: use localStorage for browser only
const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined"

const storage = isBrowser ? {
  getItem: (k: string) => localStorage.getItem(k),
  setItem: (k: string, v: string) => localStorage.setItem(k, v),
  removeItem: (k: string) => localStorage.removeItem(k)
} : {
  // Server-side storage is not available in client components
  getItem: (k: string) => null,
  setItem: (k: string, v: string) => {},
  removeItem: (k: string) => {}
}

// Auth helper functions (client-safe)
export const auth = {
  getCurrentUser: (): User | null => {
    try {
      const userStr = storage.getItem("currentUser")
      return userStr ? JSON.parse(userStr) : null
    } catch {
      return null
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
      // noop on server
    }
  },

  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        return null
      }

      const user = await response.json()
      auth.setCurrentUser(user)
      return user
    } catch (error) {
      console.error('Login error:', error)
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

// Client-side database functions that make API calls
export const db = {
  // Events
  getEvents: async (): Promise<Event[]> => {
    const response = await fetch('/api/events', {
      headers: {
        'Authorization': `Bearer ${storage.getItem('currentUser') || ''}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch events')
    return response.json()
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.getItem('currentUser') || ''}`
      },
      body: JSON.stringify(eventData)
    })
    if (!response.ok) throw new Error('Failed to create event')
    return response.json()
  },

  updateEvent: async (eventId: string, eventData: Partial<Event>): Promise<boolean> => {
    const response = await fetch('/api/events', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.getItem('currentUser') || ''}`
      },
      body: JSON.stringify({ eventId, eventData })
    })
    if (!response.ok) throw new Error('Failed to update event')
    return true
  },

  deleteEvent: async (eventId: string): Promise<boolean> => {
    const response = await fetch('/api/events', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.getItem('currentUser') || ''}`
      },
      body: JSON.stringify({ eventId })
    })
    if (!response.ok) throw new Error('Failed to delete event')
    return true
  },

  // Files
  getFiles: async (): Promise<any[]> => {
    const response = await fetch('/api/files', {
      headers: {
        'Authorization': `Bearer ${storage.getItem('currentUser') || ''}`
      }
    })
    if (!response.ok) throw new Error('Failed to fetch files')
    const data = await response.json()
    // Flatten the organized files structure
    return data.flatMap((item: any) => item.files)
  },

  getFilesByEventId: async (eventId: string): Promise<UploadedFile[]> => {
    const allFiles = await db.getFiles()
    return allFiles.filter(file => file.eventId === eventId)
  },

  createFile: async (fileData: Omit<UploadedFile, 'id' | 'uploadedAt'>): Promise<UploadedFile> => {
    const formData = new FormData()
    // This would need to be handled differently since file upload is more complex
    // For now, throw an error - file uploads should use the file upload component
    throw new Error('Use file upload API directly for file creation')
  },

  deleteFile: async (fileId: string): Promise<boolean> => {
    const response = await fetch('/api/files', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storage.getItem('currentUser') || ''}`
      },
      body: JSON.stringify({ fileId })
    })
    if (!response.ok) throw new Error('Failed to delete file')
    return true
  },

  // Users
  getUserByEmail: async (email: string): Promise<User | null> => {
    // This is mainly used during registration, so we'll handle it in the register page
    throw new Error('Use registration API directly')
  },

  createUser: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create user')
    }
    return response.json()
  }
}
