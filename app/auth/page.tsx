"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // Initialize database with sample data
    fetch('/api/init', { method: 'POST' }).catch(console.error)

    // Check if user is already logged in
    if (auth.isAuthenticated()) {
      const user = auth.getCurrentUser()
      if (user?.role === "coordinator") {
        router.push("/coordinator")
      } else {
        router.push("/student")
      }
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <Card className="w-full max-w-2xl relative z-10 shadow-2xl border-2 border-cyan-400/30 bg-white/95">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            BEC
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Basaveshwar Engineering College
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">Event Management System - RISE Initiative</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-24 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all hover:scale-105 shadow-lg"
              onClick={() => router.push("/login")}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span>Login</span>
              </div>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-24 text-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all hover:scale-105 bg-transparent"
              onClick={() => router.push("/register")}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span>Create Account</span>
              </div>
            </Button>
          </div>

          <div className="pt-6 border-t">
            <p className="text-center text-sm text-gray-600">Information Science and Engineering Department</p>
            <p className="text-center text-xs text-gray-500 mt-2">
              © 2025 Basaveshwar Engineering College, Bagalkot. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
