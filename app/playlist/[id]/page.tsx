"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Heart, Share, MoreHorizontal, Clock, ArrowLeft, Users, MusicIcon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useAudio } from "@/components/audio-provider"
import SearchBar from "@/components/search-bar"

interface Playlist {
  _id: string
  name: string
  description?: string
  owner: string
  ownerName: string
  songs: string[]
  isPublic: boolean
  followers: string[]
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

interface Song {
  _id: string
  title: string
  artistName: string
  duration: number
  plays: number
  audioUrl: string
  imageUrl?: string
  albumName?: string
}

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const { user, logout } = useAuth()
  const { playTrack, playPlaylist } = useAudio()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    fetchPlaylist()
  }, [params.id])

  useEffect(() => {
    if (playlist && user) {
      setIsFollowing(playlist.followers.includes(user._id!))
    }
  }, [playlist, user])

  const fetchPlaylist = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/playlists/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError("Playlist not found")
        } else {
          setError("Failed to load playlist")
        }
        return
      }

      const data = await response.json()
      setPlaylist(data.playlist)

      if (data.playlist?.songs?.length > 0) {
        await fetchPlaylistSongs(data.playlist.songs)
      }
    } catch (error) {
      console.error("Error fetching playlist:", error)
      setError("Failed to load playlist")
    } finally {
      setLoading(false)
    }
  }

  const fetchPlaylistSongs = async (songIds: string[]) => {
    try {
      const songPromises = songIds.map((id) => fetch(`/api/songs/${id}`).then((res) => (res.ok ? res.json() : null)))

      const songResults = await Promise.all(songPromises)
      const validSongs = songResults.filter((result) => result?.song).map((result) => result.song)

      setSongs(validSongs)
    } catch (error) {
      console.error("Error fetching playlist songs:", error)
    }
  }

  const handlePlayPlaylist = () => {
    if (songs.length === 0) return

    const tracks = songs.map((song, index) => ({
      id: Number.parseInt(song._id.slice(-6), 16) + index,
      title: song.title,
      artist: song.artistName,
      album: song.albumName || "Single",
      duration: song.duration,
      audioUrl: song.audioUrl,
      image:
        song.imageUrl ||
        playlist?.imageUrl ||
        `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(song.title)}`,
    }))

    playPlaylist(tracks)
  }

  const handlePlaySong = (song: Song, index: number) => {
    const tracks = songs.map((s, i) => ({
      id: Number.parseInt(s._id.slice(-6), 16) + i,
      title: s.title,
      artist: s.artistName,
      album: s.albumName || "Single",
      duration: s.duration,
      audioUrl: s.audioUrl,
      image:
        s.imageUrl || playlist?.imageUrl || `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(s.title)}`,
    }))

    playPlaylist(tracks, index)
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

  const getTotalDuration = () => {
    const total = songs.reduce((acc, song) => acc + song.duration, 0)
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
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
              <p>Loading playlist...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !playlist) {
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
              <Link href="/playlists">
                <Button className="bg-white text-black hover:bg-gray-200">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Playlists
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = user && playlist.owner === user._id

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

      {/* Playlist Hero */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/playlists">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Playlists
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative">
              <Image
                src={
                  playlist.imageUrl ||
                  `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(playlist.name) || "/placeholder.svg"}`
                }
                alt={playlist.name}
                width={400}
                height={400}
                className="rounded-lg aspect-square object-cover"
              />
              <Button
                size="icon"
                className="absolute bottom-4 right-4 bg-white text-black hover:bg-gray-200 w-16 h-16"
                onClick={handlePlayPlaylist}
                disabled={songs.length === 0}
              >
                <Play className="w-8 h-8" />
              </Button>
            </div>

            <div className="flex-1">
              <Badge className="bg-gray-800 text-gray-300 mb-2">
                {playlist.isPublic ? "Public Playlist" : "Private Playlist"}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{playlist.name}</h1>

              <Link
                href={`/profile/${playlist.ownerName}`}
                className="text-2xl text-gray-300 hover:text-white mb-4 block"
              >
                By {playlist.ownerName}
              </Link>

              <div className="flex items-center gap-6 mb-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{playlist.followers.length} followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <MusicIcon className="w-4 h-4" />
                  <span>{songs.length} songs</span>
                </div>
                <span>{getTotalDuration()}</span>
              </div>

              {playlist.description && (
                <p className="text-gray-300 mb-8 max-w-2xl leading-relaxed">{playlist.description}</p>
              )}

              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={handlePlayPlaylist}
                  disabled={songs.length === 0}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play Playlist
                </Button>
                {!isOwner && (
                  <Button
                    variant="outline"
                    className={`border-gray-700 hover:bg-gray-800 bg-transparent ${
                      isFollowing ? "text-green-500 border-green-500" : "text-white"
                    }`}
                    disabled={!user}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? "fill-current" : ""}`} />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Track List */}
      <section className="px-4 pb-20">
        <div className="container mx-auto">
          {songs.length > 0 ? (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-4 text-gray-400 text-sm border-b border-gray-800 pb-2">
                  <span className="w-8">#</span>
                  <span className="flex-1">Title</span>
                  <span className="w-16 text-center hidden sm:block">Plays</span>
                  <span className="w-16 text-center">
                    <Clock className="w-4 h-4 mx-auto" />
                  </span>
                  <span className="w-12"></span>
                </div>
              </div>

              <div className="space-y-1">
                {songs.map((song, index) => (
                  <Card
                    key={song._id}
                    className="bg-transparent border-transparent hover:bg-gray-900/50 transition-colors group cursor-pointer"
                    onClick={() => handlePlaySong(song, index)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-4">
                        <div className="w-8 text-center">
                          <span className="text-gray-400 group-hover:hidden">{index + 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 hidden group-hover:flex text-white hover:bg-transparent"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-3">
                          <Image
                            src={
                              song.imageUrl ||
                              `/placeholder.svg?height=40&width=40&text=${encodeURIComponent(song.title.charAt(0)) || "/placeholder.svg"}`
                            }
                            alt={song.title}
                            width={40}
                            height={40}
                            className="rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium hover:underline">{song.title}</p>
                            <div className="text-sm text-gray-400">
                              <Link
                                href={`/artist/${song.artistName.replace(/\s+/g, "-").toLowerCase()}`}
                                className="hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {song.artistName}
                              </Link>
                              {song.albumName && (
                                <>
                                  {" • "}
                                  <Link
                                    href={`/album/${song.albumName.replace(/\s+/g, "-").toLowerCase()}`}
                                    className="hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {song.albumName}
                                  </Link>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-gray-400 text-sm w-16 text-center hidden sm:block">
                          {formatPlays(song.plays)}
                        </span>
                        <span className="text-gray-400 text-sm w-16 text-center">{formatDuration(song.duration)}</span>

                        <div className="w-12 flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MusicIcon className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Songs in Playlist</h3>
                <p>
                  This playlist is empty. {isOwner ? "Add some songs to get started!" : "Check back later for updates."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
