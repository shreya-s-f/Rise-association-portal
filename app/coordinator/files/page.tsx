"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { YearFiles } from "@/components/ui/year-files"
import { Card, CardContent } from "@/components/ui/card"

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
      setYears(uniqueYears.sort().reverse()) // Most recent years first
    } catch (error) {
      console.error('Failed to load years:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/coordinator")}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {years.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">No events found</div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {years.map(year => (
              <YearFiles key={year} year={year} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}