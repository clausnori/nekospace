"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Heart, Share, MoreHorizontal, Clock, ArrowLeft } from "lucide-react"
import { useAudio } from "@/components/audio-provider"
import { useAuth } from "@/components/auth-provider"
import SearchBar from "@/components/search-bar"

interface Album {
  _id: string
  title: string
  artistName: string
  description?: string
  genre: string
  releaseDate: string
  imageUrl?: string
  songs: string[]
  status: string
}

interface Song {
  _id: string
  title: string
  artistName: string
  duration: number
  plays: number
  audioUrl: string
  imageUrl?: string
}

export default function AlbumPage({ params }: { params: { slug: string } }) {
  const { user, logout } = useAuth()
  const { playTrack, playPlaylist } = useAudio()
  const [album, setAlbum] = useState<Album | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAlbum()
  }, [params.slug])

  const fetchAlbum = async () => {
    try {
      setLoading(true)

      // Try to fetch by ID first, then by slug
      const response = await fetch(`/api/albums/${params.slug}`)

      if (!response.ok) {
        // If not found by ID, try searching by title
        const searchResponse = await fetch(`/api/albums?limit=1`)
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          const foundAlbum = searchData.albums?.find(
            (a: Album) => a.title.toLowerCase().replace(/\s+/g, "-") === params.slug.toLowerCase(),
          )

          if (foundAlbum) {
            setAlbum(foundAlbum)
            await fetchAlbumSongs(foundAlbum.songs)
            return
          }
        }

        setError("Album not found")
        return
      }

      const data = await response.json()
      setAlbum(data.album)

      if (data.album?.songs?.length > 0) {
        await fetchAlbumSongs(data.album.songs)
      }
    } catch (error) {
      console.error("Error fetching album:", error)
      setError("Failed to load album")
    } finally {
      setLoading(false)
    }
  }

  const fetchAlbumSongs = async (songIds: string[]) => {
    try {
      const songPromises = songIds.map((id) => fetch(`/api/songs/${id}`).then((res) => (res.ok ? res.json() : null)))

      const songResults = await Promise.all(songPromises)
      const validSongs = songResults.filter((result) => result?.song).map((result) => result.song)

      setSongs(validSongs)
    } catch (error) {
      console.error("Error fetching album songs:", error)
    }
  }

  const handlePlayAlbum = () => {
    if (songs.length === 0) return

    const tracks = songs.map((song, index) => ({
      id: Number.parseInt(song._id.slice(-6), 16) + index,
      title: song.title,
      artist: song.artistName,
      album: album?.title || "Unknown Album",
      duration: song.duration,
      audioUrl: song.audioUrl,
      image:
        song.imageUrl ||
        album?.imageUrl ||
        "/placeholder.svg?height=300&width=300&text=" + encodeURIComponent(song.title),
    }))

    playPlaylist(tracks)
  }

  const handlePlaySong = (song: Song, index: number) => {
    const tracks = songs.map((s, i) => ({
      id: Number.parseInt(s._id.slice(-6), 16) + i,
      title: s.title,
      artist: s.artistName,
      album: album?.title || "Unknown Album",
      duration: s.duration,
      audioUrl: s.audioUrl,
      image:
        s.imageUrl || album?.imageUrl || "/placeholder.svg?height=300&width=300&text=" + encodeURIComponent(s.title),
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
              <p>Loading album...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !album) {
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

      {/* Album Hero */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative">
              <Image
                src={album.imageUrl || "/placeholder.svg?height=400&width=400&text=" + encodeURIComponent(album.title)}
                alt={album.title}
                width={400}
                height={400}
                className="rounded-lg aspect-square object-cover"
              />
              <Button
                size="icon"
                className="absolute bottom-4 right-4 bg-white text-black hover:bg-gray-200 w-16 h-16"
                onClick={handlePlayAlbum}
                disabled={songs.length === 0}
              >
                <Play className="w-8 h-8" />
              </Button>
            </div>

            <div className="flex-1">
              <Badge className="bg-gray-800 text-gray-300 mb-2">Album</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{album.title}</h1>

              <Link
                href={`/artist/${album.artistName.replace(/\s+/g, "-").toLowerCase()}`}
                className="text-2xl text-gray-300 hover:text-white mb-4 block"
              >
                {album.artistName}
              </Link>

              <div className="flex items-center gap-6 mb-6 text-gray-400">
                <span>{new Date(album.releaseDate).getFullYear()}</span>
                <span>{songs.length} tracks</span>
                <span>{getTotalDuration()}</span>
              </div>

              <Badge variant="secondary" className="bg-gray-800 text-gray-300 mb-6">
                {album.genre}
              </Badge>

              {album.description && <p className="text-gray-300 mb-8 max-w-2xl leading-relaxed">{album.description}</p>}

              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={handlePlayAlbum}
                  disabled={songs.length === 0}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play Album
                </Button>
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                  <Heart className="w-4 h-4 mr-2" />
                  Save
                </Button>
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

                        <div className="flex-1">
                          <p className="font-medium hover:underline">{song.title}</p>
                          <div className="text-sm text-gray-400">
                            <Link
                              href={`/artist/${album.artistName.replace(/\s+/g, "-").toLowerCase()}`}
                              className="hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {album.artistName}
                            </Link>
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
                <Clock className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Songs Available</h3>
                <p>This album doesn't have any songs yet.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
