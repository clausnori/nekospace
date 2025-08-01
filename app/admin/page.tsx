"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Users,
  Music,
  Flag,
  BarChart3,
  Shield,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Play,
  Heart,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useAudio } from "@/components/audio-provider"
import SearchBar from "@/components/search-bar"
import { MUSIC_GENRES } from "@/lib/genres"

interface DashboardStats {
  totalUsers: number
  totalSongs: number
  totalReports: number
  pendingReports: number
  totalPlays: number
  newUsersToday: number
}

interface Song {
  _id: string
  title: string
  artist: string
  artistName: string
  duration: number
  genre: string
  audioUrl: string
  imageUrl?: string
  plays: number
  likes: string[]
  status: "draft" | "published"
  createdAt: string
  updatedAt: string
}

interface User {
  _id: string
  firstName: string
  lastName: string
  username: string
  email: string
  userType: string
  verified: boolean
  avatar?: string
  createdAt: string
}

interface Report {
  _id: string
  reporterId: string
  reporterName: string
  targetType: string
  targetId: string
  targetTitle?: string
  reason: string
  description?: string
  status: string
  adminNotes?: string
  createdAt: string
}

export default function AdminPage() {
  const { user, logout } = useAuth()
  const { playTrack } = useAudio()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalSongs: 0,
    totalReports: 0,
    pendingReports: 0,
    totalPlays: 0,
    newUsersToday: 0,
  })
  const [songs, setSongs] = useState<Song[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [genreFilter, setGenreFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [reportStatusFilter, setReportStatusFilter] = useState("")

  useEffect(() => {
    if (user && user.userType === "admin") {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const [statsRes, songsRes, usersRes, reportsRes] = await Promise.all([
        fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/songs?limit=100&includeUnpublished=true", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/users?limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/reports?limit=100", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (songsRes.ok) {
        const songsData = await songsRes.json()
        setSongs(songsData.songs || [])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData.reports || [])
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSongStatus = async (songId: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      const newStatus = currentStatus === "published" ? "draft" : "published"

      const response = await fetch(`/api/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSongs(
          songs.map((song) => (song._id === songId ? { ...song, status: newStatus as "draft" | "published" } : song)),
        )
      }
    } catch (error) {
      console.error("Error updating song status:", error)
    }
  }

  const deleteSong = async (songId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/songs/${songId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSongs(songs.filter((song) => song._id !== songId))
      }
    } catch (error) {
      console.error("Error deleting song:", error)
    }
  }

  const verifyUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, verified: true } : u)))
      }
    } catch (error) {
      console.error("Error verifying user:", error)
    }
  }

  const updateReportStatus = async (reportId: string, status: string, adminNotes?: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNotes }),
      })

      if (response.ok) {
        const data = await response.json()
        setReports(reports.map((report) => (report._id === reportId ? data.report : report)))
      }
    } catch (error) {
      console.error("Error updating report:", error)
    }
  }

  const handlePlaySong = (song: Song) => {
    const track = {
      id: Number.parseInt(song._id.slice(-6), 16),
      title: song.title,
      artist: song.artistName,
      album: "Single",
      duration: song.duration,
      audioUrl: song.audioUrl,
      image: song.imageUrl || `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(song.title)}`,
    }
    playTrack(track)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`
    if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`
    return plays.toString()
  }

  // Filter functions
  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artistName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = !genreFilter || song.genre === genreFilter
    const matchesStatus = !statusFilter || song.status === statusFilter
    return matchesSearch && matchesGenre && matchesStatus
  })

  const filteredReports = reports.filter((report) => {
    const matchesStatus = !reportStatusFilter || report.status === reportStatusFilter
    return matchesStatus
  })

  if (!user || user.userType !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Admin access required</p>
          <Link href="/">
            <Button className="bg-white text-black hover:bg-gray-200">Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-xl md:text-2xl font-bold">
              NekoSpaces Admin
            </Link>
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-red-600 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users, content, and reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Songs</p>
                  <p className="text-2xl font-bold">{stats.totalSongs.toLocaleString()}</p>
                </div>
                <Music className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Reports</p>
                  <p className="text-2xl font-bold text-red-500">{stats.pendingReports}</p>
                </div>
                <Flag className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Plays</p>
                  <p className="text-2xl font-bold">{formatPlays(stats.totalPlays)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="songs" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="songs" className="data-[state=active]:bg-gray-800">
              <Music className="w-4 h-4 mr-2" />
              Songs ({songs.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-800">
              <Users className="w-4 h-4 mr-2" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gray-800">
              <Flag className="w-4 h-4 mr-2" />
              Reports ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-800">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Songs Management */}
          <TabsContent value="songs" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search songs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full md:w-48">
                  <SelectValue placeholder="Filter by genre" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="allGenres">All Genres</SelectItem>
                  {MUSIC_GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="allStatus">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-700 rounded animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSongs.map((song) => (
                  <Card key={song._id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Image
                            src={
                              song.imageUrl ||
                              `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(song.title.charAt(0))}`
                            }
                            alt={song.title}
                            width={48}
                            height={48}
                            className="rounded"
                          />
                          <Button
                            size="icon"
                            className="absolute inset-0 bg-black/60 hover:bg-black/80 opacity-0 hover:opacity-100 transition-opacity w-12 h-12"
                            onClick={() => handlePlaySong(song)}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold">{song.title}</h3>
                          <p className="text-sm text-gray-400">
                            by {song.artistName} • {song.genre} • {formatDuration(song.duration)}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              {formatPlays(song.plays)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {song.likes.length}
                            </span>
                            <span>Created: {new Date(song.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${song.status === "published" ? "bg-green-600" : "bg-yellow-600"} text-white`}
                          >
                            {song.status}
                          </Badge>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-gray-400 hover:text-white"
                            onClick={() => toggleSongStatus(song._id, song.status)}
                            title={song.status === "published" ? "Unpublish song" : "Publish song"}
                          >
                            {song.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Song</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Are you sure you want to delete "{song.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteSong(song._id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredSongs.length === 0 && (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold mb-2">No Songs Found</h3>
                    <p className="text-gray-400">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user._id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Image
                        src={
                          user.avatar ||
                          `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(user.firstName.charAt(0) + user.lastName.charAt(0))}`
                        }
                        alt={`${user.firstName} ${user.lastName}`}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-400">@{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        className={`${user.userType === "admin" ? "bg-red-600" : user.userType === "author" ? "bg-blue-600" : "bg-gray-600"} text-white`}
                      >
                        {user.userType}
                      </Badge>
                      <Badge className={`${user.verified ? "bg-green-600" : "bg-yellow-600"} text-white`}>
                        {user.verified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>

                    {!user.verified && user.userType === "author" && (
                      <Button
                        onClick={() => verifyUser(user._id)}
                        size="sm"
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify User
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reports Management */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <Select value={reportStatusFilter} onValueChange={setReportStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="allReports">All Reports</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report._id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={`${
                              report.status === "pending"
                                ? "bg-yellow-600"
                                : report.status === "reviewed"
                                  ? "bg-blue-600"
                                  : report.status === "resolved"
                                    ? "bg-green-600"
                                    : "bg-gray-600"
                            } text-white`}
                          >
                            {report.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {report.targetType}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{report.targetTitle || `${report.targetType} Report`}</h3>
                        <p className="text-sm text-gray-400 mb-2">Reported by: {report.reporterName}</p>
                        <p className="text-sm text-gray-300 mb-2">
                          <strong>Reason:</strong> {report.reason}
                        </p>
                        {report.description && (
                          <p className="text-sm text-gray-300 mb-2">
                            <strong>Details:</strong> {report.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">Reported: {new Date(report.createdAt).toLocaleString()}</p>
                        {report.adminNotes && (
                          <div className="mt-2 p-2 bg-gray-800 rounded">
                            <p className="text-xs text-gray-400">Admin Notes:</p>
                            <p className="text-sm text-gray-300">{report.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {report.status === "pending" && (
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-800 text-white">
                            <DialogHeader>
                              <DialogTitle>Review Report</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Add notes and update the status of this report
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Admin Notes</Label>
                                <Textarea
                                  placeholder="Add your review notes..."
                                  className="bg-gray-800 border-gray-700 text-white mt-2"
                                  rows={3}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => updateReportStatus(report._id, "resolved")}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Resolve
                                </Button>
                                <Button
                                  onClick={() => updateReportStatus(report._id, "dismissed")}
                                  className="bg-gray-600 hover:bg-gray-700 text-white"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Dismiss
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <Flag className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2">No Reports Found</h3>
                  <p className="text-gray-400">No reports match your current filters</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Platform Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Users</span>
                      <span className="font-semibold">{stats.totalUsers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Songs</span>
                      <span className="font-semibold">{stats.totalSongs.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Plays</span>
                      <span className="font-semibold">{formatPlays(stats.totalPlays)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">New Users Today</span>
                      <span className="font-semibold text-green-500">{stats.newUsersToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Pending Reports</span>
                      <span className="font-semibold text-red-500">{stats.pendingReports}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Top Genres</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      songs.reduce(
                        (acc, song) => {
                          acc[song.genre] = (acc[song.genre] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 8)
                      .map(([genre, count]) => (
                        <div key={genre} className="flex items-center justify-between">
                          <span className="text-gray-300">{genre}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (count /
                                      Math.max(
                                        ...Object.values(
                                          songs.reduce(
                                            (acc, song) => {
                                              acc[song.genre] = (acc[song.genre] || 0) + 1
                                              return acc
                                            },
                                            {} as Record<string, number>,
                                          ),
                                        ),
                                      )) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-400 w-8">{count}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
