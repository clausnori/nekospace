"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Heart, MoreHorizontal, TrendingUp, Music } from "lucide-react"
import Image from "next/image"
import { useAudio } from "@/components/audio-provider"
import { useAuth } from "@/components/auth-provider"
import SearchBar from "@/components/search-bar"

interface Song {
  _id: string
  title: string
  artistName: string
  albumName?: string
  plays: number
  duration: number
  genre: string
  imageUrl?: string
  audioUrl: string
}

export default function HomePage() {
  const { playTrack, playPlaylist } = useAudio()
  const { user, logout } = useAuth()
  const [topSongs, setTopSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  const categories = ["All", "Electronic", "Synthwave", "Ambient", "Chillwave", "Lo-fi", "Trap"]

  useEffect(() => {
    fetchTopSongs()
  }, [])

  const fetchTopSongs = async () => {
    try {
      const response = await fetch("/api/songs?limit=10")
      if (response.ok) {
        const data = await response.json()
        setTopSongs(data.songs || [])
      }
    } catch (error) {
      console.error("Error fetching songs:", error)
    } finally {
      setLoading(false)
    }
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

  const handlePlaySong = (song: Song) => {
    const track = {
      id: Number.parseInt(song._id.slice(-6), 16), // Convert ObjectId to number
      title: song.title,
      artist: song.artistName,
      album: song.albumName || "Unknown Album",
      duration: song.duration,
      audioUrl: song.audioUrl,
      image: song.imageUrl || "/placeholder.svg?height=300&width=300&text=" + encodeURIComponent(song.title),
    }
    playTrack(track)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-xl md:text-2xl font-bold flex-shrink-0">
              NekoSpaces
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="/discover" className="text-gray-300 hover:text-white transition-colors">
                Discover
              </Link>
              <Link href="/artists" className="text-gray-300 hover:text-white transition-colors">
                Artists
              </Link>
              <Link href="/albums" className="text-gray-300 hover:text-white transition-colors">
                Albums
              </Link>
              {user && (
                <Link href="/playlists" className="text-gray-300 hover:text-white transition-colors">
                  Playlists
                </Link>
              )}
            </nav>

            {/* Search Bar - Hidden on mobile, shown on tablet+ */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <SearchBar />
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {user ? (
                <div className="flex items-center space-x-2 md:space-x-4">
                  {user.userType === "admin" && (
                    <Link href="/admin" className="hidden sm:block">
                      <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-900/20">
                        Admin
                      </Button>
                    </Link>
                  )}
                  {user.userType === "author" && (
                    <Link href="/dashboard" className="hidden sm:block">
                      <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-900/20">
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link href="/profile" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                      Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-800" onClick={logout}>
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
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

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-4">
            <SearchBar />
          </div>

          {/* Mobile Navigation */}
          <nav className="lg:hidden flex items-center justify-center space-x-6 mt-4 pb-2 border-b border-gray-800">
            <Link href="/discover" className="text-sm text-gray-300 hover:text-white transition-colors">
              Discover
            </Link>
            <Link href="/artists" className="text-sm text-gray-300 hover:text-white transition-colors">
              Artists
            </Link>
            <Link href="/albums" className="text-sm text-gray-300 hover:text-white transition-colors">
              Albums
            </Link>
            {user && (
              <Link href="/playlists" className="text-sm text-gray-300 hover:text-white transition-colors">
                Playlists
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Next
            <br />
            <span className="text-gray-400">Favorite Track</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Stream millions of songs, discover new artists, and create your perfect playlist on NekoSpaces
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-3 w-full sm:w-auto"
              onClick={() => {
                if (topSongs.length > 0) {
                  const tracks = topSongs.map((song) => ({
                    id: Number.parseInt(song._id.slice(-6), 16),
                    title: song.title,
                    artist: song.artistName,
                    album: song.albumName || "Unknown Album",
                    duration: song.duration,
                    audioUrl: song.audioUrl,
                    image:
                      song.imageUrl || "/placeholder.svg?height=300&width=300&text=" + encodeURIComponent(song.title),
                  }))
                  playPlaylist(tracks)
                }
              }}
              disabled={topSongs.length === 0}
            >
              {topSongs.length > 0 ? "Start Listening" : "No Music Available"}
            </Button>
            {!user && (
              <Link href="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-700 text-white hover:bg-gray-800 bg-transparent w-full sm:w-auto"
                >
                  Join NekoSpaces
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 mb-8">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "All" ? "default" : "secondary"}
                className={`whitespace-nowrap cursor-pointer text-xs md:text-sm px-3 py-1 ${
                  category === "All"
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-gray-800 text-white hover:bg-gray-700"
                }`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Top Music */}
      <section className="px-4 pb-20">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
            <h2 className="text-2xl md:text-3xl font-bold">Top Music</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
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
          ) : topSongs.length > 0 ? (
            <div className="space-y-2">
              {topSongs.map((song, index) => (
                <Card key={song._id} className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="text-gray-400 w-4 md:w-6 text-center text-sm md:text-base">{index + 1}</span>
                      <div className="relative flex-shrink-0">
                        <Image
                          src={
                            song.imageUrl ||
                            `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(song.title) || "/placeholder.svg"}`
                          }
                          alt={song.title}
                          width={48}
                          height={48}
                          className="rounded w-10 h-10 md:w-12 md:h-12"
                        />
                        <Button
                          size="icon"
                          className="absolute inset-0 bg-black/60 hover:bg-black/80 opacity-0 hover:opacity-100 transition-opacity w-10 h-10 md:w-12 md:h-12"
                          onClick={() => handlePlaySong(song)}
                        >
                          <Play className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/song/${song._id}`}
                          className="font-semibold hover:underline block truncate text-sm md:text-base"
                        >
                          {song.title}
                        </Link>
                        <div className="text-xs md:text-sm text-gray-400 truncate">
                          <Link
                            href={`/artist/${song.artistName.replace(/\s+/g, "-").toLowerCase()}`}
                            className="hover:underline"
                          >
                            {song.artistName}
                          </Link>
                        </div>
                      </div>
                      <div className="hidden sm:block">
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
                          {song.genre}
                        </Badge>
                      </div>
                      <span className="text-gray-400 text-xs md:text-sm hidden md:block">
                        {formatPlays(song.plays)}
                      </span>
                      <span className="text-gray-400 text-xs md:text-sm w-8 md:w-12 text-right">
                        {formatDuration(song.duration)}
                      </span>
                      <div className="flex items-center gap-1 md:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white w-8 h-8 md:w-10 md:h-10"
                        >
                          <Heart className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white w-8 h-8 md:w-10 md:h-10 hidden sm:flex"
                        >
                          <MoreHorizontal className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Music}
              title="No Music Yet"
              description="Be the first to upload music to NekoSpaces!"
              action={
                user?.userType === "author" ? (
                  <Link href="/dashboard">
                    <Button className="bg-white text-black hover:bg-gray-200">Upload Music</Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button className="bg-white text-black hover:bg-gray-200">Join as Artist</Button>
                  </Link>
                )
              }
            />
          )}
        </div>
      </section>
    </div>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
}

function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 md:py-16">
      <Icon className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-gray-600" />
      <h3 className="text-xl md:text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  )
}
