"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const COORDINATOR_PASSWORD = "rise@63"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "" as "coordinator" | "student" | "",
  })
  const [coordinatorPassword, setCoordinatorPassword] = useState("")
  const [showCoordinatorPasswordInput, setShowCoordinatorPasswordInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.role) {
      toast({
        title: "Error",
        description: "Please select your role",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const user = await auth.login(formData.email, formData.password)

      if (!user) {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (user.role !== formData.role) {
        toast({
          title: "Error",
          description: "Invalid role selected for this account",
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
        title: "Success",
        description: "Logged in successfully!",
      })

      setTimeout(() => {
        router.push("/student")
      }, 500)
    } catch (error) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleCoordinatorPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (coordinatorPassword !== COORDINATOR_PASSWORD) {
      toast({
        title: "Error",
        description: "Invalid coordinator password",
        variant: "destructive",
      })
      setCoordinatorPassword("")
      return
    }

    toast({
      title: "Success",
      description: "Logged in successfully!",
    })

    router.push("/coordinator")
  }

  if (showCoordinatorPasswordInput) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
        <Card className="w-full max-w-md shadow-2xl border-2 border-cyan-400/30 bg-white/95">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Coordinator Verification
            </CardTitle>
            <CardDescription className="text-center">Enter the coordinator password to continue</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCoordinatorPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coordinatorPassword">Coordinator Password</Label>
                <Input
                  id="coordinatorPassword"
                  type="password"
                  placeholder="Enter coordinator password"
                  value={coordinatorPassword}
                  onChange={(e) => setCoordinatorPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                Verify & Enter
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowCoordinatorPasswordInput(false)
                  setCoordinatorPassword("")
                  auth.logout()
                }}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
      <Card className="w-full max-w-md shadow-2xl border-2 border-cyan-400/30 bg-white/95">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Login
          </CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "coordinator" | "student") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto font-semibold text-blue-600"
                onClick={() => router.push("/register")}
              >
                Create Account
              </Button>
            </div>

            <Button type="button" variant="ghost" className="w-full" onClick={() => router.push("/auth")}>
              Back to Authentication
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
