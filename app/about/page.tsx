"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  GraduationCap,
  Target,
  Compass,
  HeartHandshake,
  Users,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react"

export default function AboutDepartmentPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col">
      {/* Background glowing ambiance */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-float" />

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/login")}
              className="border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800 text-xs sm:text-sm"
            >
              Sign In
            </Button>
            <Button
              onClick={() => router.push("/student")}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs sm:text-sm shadow-md"
            >
              Enter Portal
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider">
            Established Academic Excellence
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            Department of{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Information Science & Engineering
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Basaveshwar Engineering College (Autonomous), Bagalkot. Committed to excellence
            in education, research, innovation, and industry alignment in emerging technologies.
          </p>
        </div>

        {/* Vision, Mission, Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-cyan-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Vision</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              To be a center of excellence in Information Science and Engineering education and research,
              nurturing globally competent IT professionals who contribute to technological and societal advancement.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Mission</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              To provide rigorous, industry-relevant curriculum, state-of-the-art laboratory infrastructure,
              and collaborative learning environments that inspire research, entrepreneurship, and lifelong learning.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Core Values</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Excellence, Integrity, Innovation, Inclusive Learning, and Social Responsibility guided by
              the vision of Basaveshwara and the BVVS legacy.
            </p>
          </div>
        </div>

        {/* RISE Association Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900/70 to-indigo-950/60 border border-slate-800 backdrop-blur-xl mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-3">
              <Sparkles className="w-4 h-4" />
              <span>THE STUDENT ASSOCIATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              RISE: Radiant Information Scientists and Engineers
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              RISE represents the vibrant body of students and faculty of the ISE department.
              Throughout the academic year, RISE organizes national technical symposiums, hands-on
              bootcamps, industry expert lectures, and cultural events like UTSANGA and INCEPTA.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-slate-800 text-slate-200 border-slate-700">IoT & Embedded Systems</Badge>
              <Badge className="bg-slate-800 text-slate-200 border-slate-700">AI & Machine Learning</Badge>
              <Badge className="bg-slate-800 text-slate-200 border-slate-700">Web & Cloud Computing</Badge>
              <Badge className="bg-slate-800 text-slate-200 border-slate-700">Cybersecurity</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full sm:w-auto">
            <Button
              size="lg"
              onClick={() => router.push("/student")}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-xl shadow-cyan-500/20"
            >
              Browse Event Archives
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
              className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            >
              Coordinator Uploads
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500">
        © Basaveshwar Engineering College, Bagalkot. Department of Information Science & Engineering. All rights reserved.
      </footer>
    </div>
  )
}
