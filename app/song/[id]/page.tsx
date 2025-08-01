"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Heart, Share, MoreHorizontal, ArrowLeft } from "lucide-react"
import { useAudio } from "@/components/audio-provider"
import { useAuth } from "@/components/auth-provider"
import SearchBar from "@/components/search-bar"
import CommentSection from "@/components/comment-section"
import ReportDialog from "@/components/report-dialog"

interface Song {
  _id: string
  title: string
  artistName: string
  albumName?: string
  duration: number
  genre: string
  plays: number
  likes: string[]
  imageUrl?: string
  audioUrl: string
  lyrics?: string
  createdAt: string
}

interface RelatedSong {
  _id: string
  title: string
  artistName: string
  duration: number
  imageUrl?: string
  audioUrl: string
}

export default function SongPage({ params }: { params: { id: string } }) {
  const { user, logout } = useAuth()
  const { playTrack, currentTrack, isPlaying, togglePlayPause, currentTime } = useAudio()
  const [song, setSong] = useState<Song | null>(null)
  const [relatedSongs, setRelatedSongs] = useState<RelatedSong[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    fetchSong()
  }, [params.id])

  useEffect(() => {
    if (song && user) {
      setIsLiked(song.likes.includes(user._id!))
    }
  }, [song, user])

  const fetchSong = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/songs/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError("Song not found")
        } else {
          setError("Failed to load song")
        }
        return
      }

      const data = await response.json()
      setSong(data.song)

      // Fetch related songs by same artist or genre
      if (data.song) {
        const relatedResponse = await fetch(`/api/songs?genre=${data.song.genre}&limit=5&skip=0`)
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json()
          setRelatedSongs(relatedData.songs.filter((s: RelatedSong) => s._id !== params.id).slice(0, 4))
        }

        // Increment play count
        fetch(`/api/songs/${params.id}/play`, { method: "POST" }).catch(console.error)
      }
    } catch (error) {
      console.error("Error fetching song:", error)
      setError("Failed to load song")
    } finally {
      setLoading(false)
    }
  }

  const handlePlaySong = (songToPlay: Song | RelatedSong) => {
    const track = {
      id: Number.parseInt(songToPlay._id.slice(-6), 16),
      title: songToPlay.title,
      artist: songToPlay.artistName,
      album: "albumName" in songToPlay ? songToPlay.albumName || "Single" : "Single",
      duration: songToPlay.duration,
      audioUrl: songToPlay.audioUrl,
      image:
        songToPlay.imageUrl || "/placeholder.svg?height=300&width=300&text=" + encodeURIComponent(songToPlay.title),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-gray-800 bg-black/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                NekoSpaces
              </Link>
              <div className="flex items-center space-x-4">
                <SearchBar />
                {user ? (
                  <Button variant="ghost" onClick={logout}>
                    Logout
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button>Login</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading song...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !song) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="border-b border-gray-800 bg-black/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                NekoSpaces
              </Link>
              <div className="flex items-center space-x-4">
                <SearchBar />
                {user ? (
                  <Button variant="ghost" onClick={logout}>
                    Logout
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button>Login</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">{error}</h1>
              <Link href="/">
                <Button className="bg-white text-black hover:bg-gray-200">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isCurrentSong = currentTrack?.id === Number.parseInt(song._id.slice(-6), 16)

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
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                      Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="md:hidden mt-4">
            <SearchBar />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/">
                <Button variant="ghost" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>

            {/* Song Info */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="relative">
                <Image
                  src={song.imageUrl || "/placeholder.svg?height=400&width=400&text=" + encodeURIComponent(song.title)}
                  alt={song.title}
                  width={400}
                  height={400}
                  className="rounded-lg w-full md:w-80 aspect-square object-cover"
                />
              </div>

              <div className="flex-1">
                <Badge className="bg-gray-800 text-gray-300 mb-2">{song.genre}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{song.title}</h1>
                <Link
                  href={`/artist/${song.artistName.replace(/\s+/g, "-").toLowerCase()}`}
                  className="text-xl text-gray-300 hover:text-white mb-4 block"
                >
                  {song.artistName}
                </Link>

                <div className="flex items-center gap-6 mb-6 text-gray-400">
                  {song.albumName && (
                    <span>
                      Album:{" "}
                      <Link
                        href={`/album/${song.albumName.replace(/\s+/g, "-").toLowerCase()}`}
                        className="text-white hover:underline"
                      >
                        {song.albumName}
                      </Link>
                    </span>
                  )}
                  <span>{new Date(song.createdAt).getFullYear()}</span>
                  <span>{formatDuration(song.duration)}</span>
                </div>

                <div className="flex items-center gap-6 mb-6 text-gray-400">
                  <span>{formatPlays(song.plays)} plays</span>
                  <span>{song.likes.length} likes</span>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-gray-200"
                    onClick={() => {
                      if (isCurrentSong) {
                        togglePlayPause()
                      } else {
                        handlePlaySong(song)
                      }
                    }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {isCurrentSong && isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button
                    variant="outline"
                    className={`border-gray-700 hover:bg-gray-800 bg-transparent ${
                      isLiked ? "text-red-500 border-red-500" : "text-white"
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                    {isLiked ? "Liked" : "Like"}
                  </Button>
                  <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <ReportDialog targetType="song" targetId={song._id} targetTitle={song.title}>
                    <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </ReportDialog>
                </div>
              </div>
            </div>

            {/* Lyrics */}
            {song.lyrics && (
              <Card className="bg-gray-900 border-gray-800 mb-8">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Lyrics</h2>
                  <div className="space-y-2">
                    {song.lyrics.split("\n").map((line, index) => (
                      <p key={index} className={`text-lg ${line === "" ? "mb-4" : "text-gray-300"}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <CommentSection songId={song._id} currentTime={currentTime} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* More from Artist */}
            {relatedSongs.length > 0 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">More from {song.artistName}</h3>
                  <div className="space-y-3">
                    {relatedSongs.map((relatedSong) => (
                      <div
                        key={relatedSong._id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition-colors group cursor-pointer"
                        onClick={() => handlePlaySong(relatedSong)}
                      >
                        <div className="relative">
                          <Image
                            src={
                              relatedSong.imageUrl ||
                              "/placeholder.svg?height=48&width=48&text=" +
                                encodeURIComponent(relatedSong.title.charAt(0)) ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={relatedSong.title}
                            width={48}
                            height={48}
                            className="rounded"
                          />
                          <Button
                            size="icon"
                            className="absolute inset-0 bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{relatedSong.title}</p>
                          <p className="text-sm text-gray-400">{relatedSong.artistName}</p>
                        </div>
                        <span className="text-sm text-gray-400">{formatDuration(relatedSong.duration)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Song Stats */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Plays</span>
                    <span>{formatPlays(song.plays)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Likes</span>
                    <span>{song.likes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Release Date</span>
                    <span>{new Date(song.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration</span>
                    <span>{formatDuration(song.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Genre</span>
                    <span>{song.genre}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
