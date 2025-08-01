"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  Music,
  AlbumIcon,
  BarChart3,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Play,
  TrendingUp,
  Heart,
  Settings,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useAudio } from "@/components/audio-provider"
import SearchBar from "@/components/search-bar"

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

interface Album {
  _id: string
  title: string
  artist: string
  artistName: string
  songs: string[]
  imageUrl?: string
  releaseDate: string
  genre: string
  status: "draft" | "published"
  createdAt: string
}

interface UploadData {
  title: string
  genre: string
  albumTitle?: string
  audioFile: File | null
  imageFile: File | null
}

interface DashboardStats {
  totalPlays: number
  totalSongs: number
  publishedSongs: number
  draftSongs: number
  totalAlbums: number
  totalFollowers: number
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { playTrack } = useAudio()
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalPlays: 0,
    totalSongs: 0,
    publishedSongs: 0,
    draftSongs: 0,
    totalAlbums: 0,
    totalFollowers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadData, setUploadData] = useState<UploadData>({
    title: "",
    genre: "",
    albumTitle: "",
    audioFile: null,
    imageFile: null,
  })
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (user && user.userType === "author") {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch user's songs (including drafts)
      const songsResponse = await fetch(`/api/songs?artist=${user?._id}&includeUnpublished=true`)
      const songsData = await songsResponse.json()
      setSongs(songsData.songs || [])

      // Fetch user's albums
      const albumsResponse = await fetch(`/api/albums?artist=${user?._id}`)
      const albumsData = await albumsResponse.json()
      setAlbums(albumsData.albums || [])

      // Calculate stats
      const userSongs = songsData?.songs || []
      const userAlbums = albumsData?.albums || []

      setStats({
        totalPlays: userSongs.reduce((acc: number, song: Song) => acc + song.plays, 0),
        totalSongs: userSongs.length,
        publishedSongs: userSongs.filter((song: Song) => song.status === "published").length,
        draftSongs: userSongs.filter((song: Song) => song.status === "draft").length,
        totalAlbums: userAlbums.length,
        totalFollowers: user?.followers?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (type: "audio" | "image", file: File | null) => {
    setUploadData((prev) => ({
      ...prev,
      [type === "audio" ? "audioFile" : "imageFile"]: file,
    }))
  }

  const uploadSong = async () => {
    if (!uploadData.audioFile || !uploadData.title.trim()) {
      setMessage("Please provide a title and audio file")
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setMessage("")

    try {
      const formData = new FormData()
      formData.append("title", uploadData.title.trim())
      formData.append("genre", uploadData.genre || "Other")
      if (uploadData.albumTitle?.trim()) {
        formData.append("albumTitle", uploadData.albumTitle.trim())
      }
      formData.append("audioFile", uploadData.audioFile)
      if (uploadData.imageFile) {
        formData.append("imageFile", uploadData.imageFile)
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setMessage("Song uploaded successfully! It's saved as a draft.")
        setUploadData({
          title: "",
          genre: "",
          albumTitle: "",
          audioFile: null,
          imageFile: null,
        })

        // Reset file inputs
        const audioInput = document.getElementById("audio-file") as HTMLInputElement
        const imageInput = document.getElementById("image-file") as HTMLInputElement
        if (audioInput) audioInput.value = ""
        if (imageInput) imageInput.value = ""

        await fetchDashboardData()
        setTimeout(() => {
          setMessage("")
          setUploadProgress(0)
        }, 3000)
      } else {
        const error = await response.json()
        setMessage(error.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setMessage("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const toggleSongStatus = async (songId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "published" ? "draft" : "published"

      const response = await fetch(`/api/songs/${songId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSongs((prev) =>
          prev.map((song) => (song._id === songId ? { ...song, status: newStatus as "draft" | "published" } : song)),
        )

        // Update stats
        setStats((prev) => ({
          ...prev,
          publishedSongs: newStatus === "published" ? prev.publishedSongs + 1 : prev.publishedSongs - 1,
          draftSongs: newStatus === "draft" ? prev.draftSongs + 1 : prev.draftSongs - 1,
        }))

        setMessage(`Song ${newStatus === "published" ? "published" : "unpublished"} successfully!`)
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error updating song status:", error)
      setMessage("Failed to update song status")
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
    if (plays >= 1000000) {
      return `${(plays / 1000000).toFixed(1)}M`
    } else if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}K`
    }
    return plays.toString()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access dashboard</h1>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-gray-200">Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (user.userType !== "author") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">Only authors can access the dashboard</p>
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
              NekoSpaces
            </Link>
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  Profile
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
          <div className="md:hidden mt-4">
            <SearchBar />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your music and track your performance</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("success") || message.includes("published") || message.includes("unpublished")
                ? "bg-green-900/50 border border-green-700 text-green-300"
                : "bg-red-900/50 border border-red-700 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Plays</p>
                  <p className="text-2xl font-bold">{formatPlays(stats.totalPlays)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Published Songs</p>
                  <p className="text-2xl font-bold text-green-500">{stats.publishedSongs}</p>
                </div>
                <Music className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Draft Songs</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.draftSongs}</p>
                </div>
                <Edit className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Albums</p>
                  <p className="text-2xl font-bold">{stats.totalAlbums}</p>
                </div>
                <AlbumIcon className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="upload" className="data-[state=active]:bg-gray-800">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="songs" className="data-[state=active]:bg-gray-800">
              <Music className="w-4 h-4 mr-2" />
              Songs ({songs.length})
            </TabsTrigger>
            <TabsTrigger value="albums" className="data-[state=active]:bg-gray-800">
              <AlbumIcon className="w-4 h-4 mr-2" />
              Albums ({albums.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-800">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Upload New Song</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Song Title *</Label>
                    <Input
                      id="title"
                      value={uploadData.title}
                      onChange={(e) => setUploadData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter song title"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Select
                      value={uploadData.genre}
                      onValueChange={(value) => setUploadData((prev) => ({ ...prev, genre: value }))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Electronic">Electronic</SelectItem>
                        <SelectItem value="Hip Hop">Hip Hop</SelectItem>
                        <SelectItem value="Rock">Rock</SelectItem>
                        <SelectItem value="Pop">Pop</SelectItem>
                        <SelectItem value="Jazz">Jazz</SelectItem>
                        <SelectItem value="Classical">Classical</SelectItem>
                        <SelectItem value="R&B">R&B</SelectItem>
                        <SelectItem value="Country">Country</SelectItem>
                        <SelectItem value="Folk">Folk</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="album-title">Album Title (Optional)</Label>
                  <Input
                    id="album-title"
                    value={uploadData.albumTitle}
                    onChange={(e) => setUploadData((prev) => ({ ...prev, albumTitle: e.target.value }))}
                    placeholder="Leave empty for single release"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audio-file">Audio File *</Label>
                    <Input
                      id="audio-file"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleFileChange("audio", e.target.files?.[0] || null)}
                      className="bg-gray-800 border-gray-700 text-white file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">MP3, WAV, FLAC supported. Max 50MB.</p>
                  </div>
                  <div>
                    <Label htmlFor="image-file">Cover Image (Optional)</Label>
                    <Input
                      id="image-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange("image", e.target.files?.[0] || null)}
                      className="bg-gray-800 border-gray-700 text-white file:bg-gray-700 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG supported. Max 5MB.</p>
                  </div>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="bg-gray-800" />
                  </div>
                )}

                <Button
                  onClick={uploadSong}
                  disabled={uploading || !uploadData.audioFile || !uploadData.title.trim()}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  {uploading ? "Uploading..." : "Upload Song"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Songs Tab */}
          <TabsContent value="songs" className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
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
            ) : songs.length > 0 ? (
              <div className="space-y-4">
                {songs.map((song) => (
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
                            {song.genre} • {formatDuration(song.duration)}
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
                            {song.status === "published" ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">No Songs Yet</h3>
                <p className="text-gray-400 mb-6">Upload your first song to get started!</p>
                <Button className="bg-white text-black hover:bg-gray-200">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Song
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Albums Tab */}
          <TabsContent value="albums" className="space-y-6">
            {albums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <Card key={album._id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <Image
                        src={
                          album.imageUrl ||
                          `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(album.title)}`
                        }
                        alt={album.title}
                        width={200}
                        height={200}
                        className="w-full aspect-square rounded-lg object-cover mb-4"
                      />
                      <h3 className="font-semibold mb-1">{album.title}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {album.genre} • {album.songs.length} tracks
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge
                          className={`${album.status === "published" ? "bg-green-600" : "bg-yellow-600"} text-white`}
                        >
                          {album.status}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white w-8 h-8">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-400 w-8 h-8">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlbumIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">No Albums Yet</h3>
                <p className="text-gray-400 mb-6">
                  Create your first album by uploading songs with the same album title!
                </p>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Plays</span>
                      <span className="font-semibold">{formatPlays(stats.totalPlays)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Average Plays per Song</span>
                      <span className="font-semibold">
                        {stats.totalSongs > 0 ? formatPlays(Math.round(stats.totalPlays / stats.totalSongs)) : "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Followers</span>
                      <span className="font-semibold">{stats.totalFollowers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Published Songs</span>
                      <span className="font-semibold text-green-500">{stats.publishedSongs}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Top Performing Songs</CardTitle>
                </CardHeader>
                <CardContent>
                  {songs.length > 0 ? (
                    <div className="space-y-3">
                      {songs
                        .filter((song) => song.status === "published")
                        .sort((a, b) => b.plays - a.plays)
                        .slice(0, 5)
                        .map((song, index) => (
                          <div key={song._id} className="flex items-center gap-3">
                            <span className="text-gray-400 w-4">{index + 1}</span>
                            <Image
                              src={
                                song.imageUrl ||
                                `/placeholder.svg?height=32&width=32&text=${encodeURIComponent(song.title.charAt(0))}`
                              }
                              alt={song.title}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{song.title}</p>
                              <p className="text-xs text-gray-400">{formatPlays(song.plays)} plays</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No published songs yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
