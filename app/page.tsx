"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/db"

export default function LandingPage() {
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center p-8 overflow-hidden">
      {/* Background with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 30, 60, 0.6), rgba(0, 40, 80, 0.7)), url('https://www.becbgk.edu/img/bg-img/bg-13.jpg')`,
        }}
      />

      {/* Top Header */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <div className="text-sm md:text-base font-semibold text-cyan-300 tracking-[0.3em] uppercase">B.V.V.S</div>
        <div className="relative">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Basaveshwar Engineering College
          </h1>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-blue-400 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mt-32">
        <a
          href="/about"
          className="inline-block px-8 py-4 text-white font-bold text-lg bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-blue-400/50"
        >
          About Department
        </a>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-sm text-cyan-300">
        © Basaveshwar Engineering College, Bagalkot. All rights reserved.
      </div>
    </div>
  )
}
