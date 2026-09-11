"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { db, auth } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ShieldCheck, GraduationCap, Sparkles } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "coordinator" | "student",
    address: "",
    dateOfBirth: "",
    yearOfStudying: "3",
    department: "Information Science and Engineering",
    phoneNumber: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.name.trim() || !formData.email.trim() || !formData.address.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all mandatory fields.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const newUser = await db.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        address: formData.address,
        dateOfBirth: formData.role === "student" ? formData.dateOfBirth : "",
        yearOfStudying: formData.role === "student" ? formData.yearOfStudying : "",
        department: formData.department,
        phoneNumber: formData.phoneNumber,
      })

      auth.setCurrentUser(newUser)

      toast({
        title: "Account Created!",
        description: `Welcome to RISE, ${newUser.name}!`,
      })

      if (newUser.role === "coordinator") {
        router.push("/coordinator")
      } else {
        router.push("/student")
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-float" />

      <Card className="w-full max-w-2xl shadow-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-2xl relative z-10">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-between">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px]">
              Registration
            </Badge>
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-bold text-white tracking-tight text-center">
            Join the RISE Association
          </CardTitle>
          <CardDescription className="text-center text-xs text-slate-400">
            Create an account to access event files, symposium registrations, and department resources
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Switcher */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Account Type</Label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "student" })}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    formData.role === "student"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student Member
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "coordinator" })}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    formData.role === "coordinator"
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Faculty / Coordinator
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-slate-300">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-slate-300">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-xs text-slate-300">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="10-digit mobile"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs text-slate-300">
                  Department
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white text-sm"
                />
              </div>

              {formData.role === "student" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="yearOfStudying" className="text-xs text-slate-300">
                      Year of Study
                    </Label>
                    <Select
                      value={formData.yearOfStudying}
                      onValueChange={(val) => setFormData({ ...formData, yearOfStudying: val })}
                    >
                      <SelectTrigger id="yearOfStudying" className="bg-slate-950/60 border-slate-700 text-white text-sm">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year (Final)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="dateOfBirth" className="text-xs text-slate-300">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="bg-slate-950/60 border-slate-700 text-white text-sm"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address" className="text-xs text-slate-300">
                  Address / City *
                </Label>
                <Input
                  id="address"
                  placeholder="e.g. Bagalkot, Karnataka"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-slate-300">
                  Password (min 6 chars) *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs text-slate-300">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-5 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.01]"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Complete Registration"}
            </Button>

            <div className="text-center text-xs text-slate-400 pt-2">
              Already registered?{" "}
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
