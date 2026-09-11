"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  Sparkles,
  CheckCircle2,
} from "lucide-react"

const COORDINATOR_PASSWORD = "rise@63"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [role, setRole] = useState<"coordinator" | "student">("coordinator")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [coordinatorPassword, setCoordinatorPassword] = useState("")
  const [showCoordinatorPasswordInput, setShowCoordinatorPasswordInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickDemo = (targetRole: "coordinator" | "student") => {
    setRole(targetRole)
    if (targetRole === "coordinator") {
      setEmail("ranjita@gmail.com")
      setPassword("ranjita123")
      setCoordinatorPassword("rise@63")
    } else {
      setEmail("mala123@gmail.com")
      setPassword("mala123")
    }
    toast({
      title: `${targetRole === "coordinator" ? "Coordinator" : "Student"} credentials loaded!`,
      description: "Click 'Sign In' to proceed.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = await auth.login(email, password)

      if (!user) {
        toast({
          title: "Invalid Credentials",
          description: "Please check your email and password.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (user.role !== role) {
        toast({
          title: "Role Mismatch",
          description: `This account is registered as a ${user.role}. Please select ${user.role} role.`,
          variant: "destructive",
        })
        auth.logout()
        setIsLoading(false)
        return
      }

      if (user.role === "coordinator") {
        setShowCoordinatorPasswordInput(true)
        setIsLoading(false)
        return
      }

      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      })

      router.push("/student")
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleCoordinatorPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (coordinatorPassword !== COORDINATOR_PASSWORD) {
      toast({
        title: "Access Denied",
        description: "Incorrect coordinator authorization passcode.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Authorized!",
      description: "Coordinator session authenticated successfully.",
    })

    router.push("/coordinator")
  }

  if (showCoordinatorPasswordInput) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-float" />

        <Card className="w-full max-w-md shadow-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl relative z-10">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2">
              <KeyRound className="w-7 h-7" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Coordinator Verification
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Enter department authorization passcode to access the management portal
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCoordinatorPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coordinatorPassword" className="text-xs text-slate-300">
                  Department Passcode
                </Label>
                <Input
                  id="coordinatorPassword"
                  type="password"
                  placeholder="Enter passcode (hint: rise@63)"
                  value={coordinatorPassword}
                  onChange={(e) => setCoordinatorPassword(e.target.value)}
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-5 shadow-lg shadow-cyan-500/25"
              >
                Verify & Enter Dashboard
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-slate-400 hover:text-white hover:bg-slate-800/50 text-xs"
                onClick={() => {
                  setShowCoordinatorPasswordInput(false)
                  setCoordinatorPassword("")
                  auth.logout()
                }}
              >
                Cancel and back to login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-float" />

      <Card className="w-full max-w-md shadow-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl relative z-10">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px]">
              RISE Portal
            </Badge>
          </div>

          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            BEC
          </div>

          <CardTitle className="text-2xl font-bold text-white tracking-tight">
            Sign In to RISE
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Basaveshwar Engineering College • Dept. of ISE
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Quick Demo Credentials Helpers */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>QUICK DEMO ACCESS (1-CLICK)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("coordinator")}
                className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-left transition-colors font-medium flex items-center justify-between"
              >
                <span>Coordinator Demo</span>
                <ShieldCheck className="w-3.5 h-3.5 opacity-70" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo("student")}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-left transition-colors font-medium flex items-center justify-between"
              >
                <span>Student Demo</span>
                <GraduationCap className="w-3.5 h-3.5 opacity-70" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection Segmented Control */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Select Role</Label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRole("coordinator")}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    role === "coordinator"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Coordinator
                </button>
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    role === "student"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-slate-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500 text-sm"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500 text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-5 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : `Sign In as ${role === "coordinator" ? "Coordinator" : "Student"}`}
            </Button>

            <div className="text-center text-xs text-slate-400 pt-2">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
              >
                Register here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
