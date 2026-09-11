"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { YearFiles } from "@/components/ui/year-files"
import { ArrowLeft, FolderGit2 } from "lucide-react"

export default function FilesPage() {
  const router = useRouter()
  const [years, setYears] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!auth.isAuthenticated() || !auth.isCoordinator()) {
      router.push("/login")
      return
    }

    loadYears()
  }, [router])

  const loadYears = async () => {
    try {
      setIsLoading(true)
      const events = await db.getEvents()
      const uniqueYears = [...new Set(events.map(e => e.year))]
      setYears(uniqueYears.sort().reverse())
    } catch (error) {
      console.error('Failed to load years:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/coordinator")}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">All Event Files by Academic Year</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading archive...</p>
          </div>
        ) : years.length === 0 ? (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl">
            <p className="text-lg">No events or uploaded archives found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {years.map(year => (
              <YearFiles key={year} year={year} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}