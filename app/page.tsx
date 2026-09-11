"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth, db, type Event } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sparkles,
  Calendar,
  Users,
  Award,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  FileText,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Layers,
  Flame,
} from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser())
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [stats, setStats] = useState({
    events: 19,
    years: 5,
    files: 78,
  })

  useEffect(() => {
    // Seed initial database
    fetch("/api/init", { method: "POST" }).catch(console.error)

    // Load preview events
    const loadPreview = async () => {
      try {
        const events = await db.getEvents()
        if (events && events.length > 0) {
          setFeaturedEvents(events.slice(0, 3))
          const yearsSet = new Set(events.map((e) => e.year))
          setStats((prev) => ({
            ...prev,
            events: events.length,
            years: yearsSet.size || 5,
          }))
        }
      } catch (e) {
        console.error(e)
      }
    }

    loadPreview()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 text-lg">
                BEC
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base sm:text-lg tracking-tight">
                  RISE Association
                </span>
                <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs hidden sm:inline-flex">
                  Dept. of ISE
                </Badge>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Basaveshwar Engineering College (Autonomous), Bagalkot
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/about"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50 hidden md:block"
            >
              About Department
            </Link>
            {currentUser ? (
              <Button
                onClick={() =>
                  router.push(
                    currentUser.role === "coordinator" ? "/coordinator" : "/student"
                  )
                }
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/login")}
                  className="border-slate-700 bg-slate-900/60 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-600"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/register")}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25"
                >
                  Register
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Welcome to the Official Association Portal</span>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
            Innovate, Learn & Lead with{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              RISE Association
            </span>
          </h1>

          <p className="max-w-2xl text-base sm:text-xl text-slate-400 leading-relaxed mb-10">
            The vibrant technical community of Information Science & Engineering at
            Basaveshwar Engineering College. Documenting academic achievements, technical
            workshops, symposiums, and student innovations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button
              size="lg"
              onClick={() => router.push("/student")}
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-size-200 hover:bg-right transition-all duration-300 shadow-xl shadow-cyan-500/25 hover:scale-105"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Events & Files
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/coordinator")}
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-200 hover:text-white backdrop-blur-sm"
            >
              <ShieldCheck className="w-5 h-5 mr-2 text-cyan-400" />
              Coordinator Dashboard
            </Button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 sm:mt-24 w-full max-w-5xl">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-left hover:border-cyan-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">{stats.events}+</div>
              <div className="text-xs text-slate-400 font-medium">Events & Workshops Organised</div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-left hover:border-blue-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">{stats.years}+ Years</div>
              <div className="text-xs text-slate-400 font-medium">Active Archives & Records</div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-left hover:border-indigo-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">{stats.files}+</div>
              <div className="text-xs text-slate-400 font-medium">Reports, Photos & Documents</div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-left hover:border-purple-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl font-extrabold text-white mb-1">1,000+</div>
              <div className="text-xs text-slate-400 font-medium">Student Participants</div>
            </div>
          </div>
        </section>

        {/* Featured Events Teaser */}
        {featuredEvents.length > 0 && (
          <section className="py-16 border-t border-slate-900 bg-slate-950/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-2">
                    <Flame className="w-4 h-4" />
                    <span>LATEST ACTIVITIES</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Recent Events & Workshops
                  </h2>
                </div>
                <Link
                  href="/student"
                  className="inline-flex items-center text-sm font-semibold text-cyan-400 hover:text-cyan-300 mt-4 md:mt-0 group"
                >
                  View all events
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {featuredEvents.map((evt) => (
                  <Card
                    key={evt.id}
                    className="bg-slate-900/60 border-slate-800 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                          {evt.year}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          {evt.eventDate}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-white mb-2 line-clamp-2">
                        {evt.eventName}
                      </h3>

                      <p className="text-sm text-slate-400 line-clamp-3 mb-6">
                        {evt.description}
                      </p>

                      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span className="truncate max-w-[180px]">
                          Coordinators: {evt.coordinatorName}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/student`)}
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-0 h-auto font-medium"
                        >
                          Details →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pillars / Features Section */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">What We Do at RISE</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Fostering holistic growth through industry immersion, technical competitions, and collaborative learning.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Hands-on Workshops</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Practical industry training in IoT, Generative AI, Machine Learning, and Cloud Infrastructure with Idea Lab.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-blue-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Coding Contests & Hackathons</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Challenging coding rounds, Web Hive, and problem-solving leagues to cultivate competitive programming skills.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-5">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Pre-Placement Talks</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Guidance from alumni and technical leaders on career opportunities, interview strategies, and cybersecurity trends.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* College Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-400">
          <div className="text-center md:text-left">
            <p className="font-semibold text-slate-200">
              Department of Information Science and Engineering
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Basaveshwar Engineering College (Autonomous), Bagalkot - 587102, Karnataka, India
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/about" className="hover:text-cyan-400 transition-colors">
              About Dept
            </Link>
            <Link href="/student" className="hover:text-cyan-400 transition-colors">
              Student Portal
            </Link>
            <Link href="/coordinator" className="hover:text-cyan-400 transition-colors">
              Coordinator Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
