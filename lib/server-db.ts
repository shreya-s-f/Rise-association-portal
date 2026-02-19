import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from "fs"
import { join } from "path"

const DATA_DIR = join(process.cwd(), "data")

// Ensure data directory exists
const ensureDataDir = () => {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }
}

export const fileStorage = {
  getItem: (key: string): string | null => {
    try {
      ensureDataDir()
      const filePath = join(DATA_DIR, `${key}.json`)
      if (!existsSync(filePath)) return null
      const data = readFileSync(filePath, 'utf-8')
      return data
    } catch {
      return null
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      ensureDataDir()
      const filePath = join(DATA_DIR, `${key}.json`)
      writeFileSync(filePath, value, 'utf-8')
    } catch (error) {
      console.error(`Error writing to ${key}.json:`, error)
      throw error
    }
  },

  removeItem: (key: string): void => {
    try {
      const filePath = join(DATA_DIR, `${key}.json`)
      if (existsSync(filePath)) {
        unlinkSync(filePath)
      }
    } catch (error) {
      console.error(`Error removing ${key}.json:`, error)
    }
  }
}