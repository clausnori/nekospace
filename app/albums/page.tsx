"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Music, Play, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useAudio } from "@/components/audio-provider"
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

export default function AlbumsPage() {
  const { user, logout } = useAuth()
  const { playPlaylist } = useAudio()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [filteredAlbums, setFilteredAlbums] = useState<Album[]>([])
  const [genres, setGenres] = useState<string[]>([])

  useEffect(() => {
    fetchAlbums()
  }, [])

  useEffect(() => {
    let filtered = albums

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (album) =>
          album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          album.artistName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by genre
    if (selectedGenre !== "all") {
      filtered = filtered.filter((album) => album.genre === selectedGenre)
    }

    setFilteredAlbums(filtered)
  }, [searchQuery, selectedGenre, albums])

  const fetchAlbums = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/albums?limit=50")

      if (response.ok) {
        const data = await response.json()
        const publishedAlbums = data.albums?.filter((album: Album) => album.status === "published") || []
        setAlbums(publishedAlbums)
        setFilteredAlbums(publishedAlbums)

        // Extract unique genres
        const uniqueGenres = Array.from(new Set(publishedAlbums.map((album: Album) => album.genre)))
        setGenres(uniqueGenres)
      }
    } catch (error) {
      console.error("Error fetching albums:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAlbum = async (album: Album) => {
    try {
      // Fetch album songs
      const songPromises = album.songs.map((songId) =>
        fetch(`/api/songs/${songId}`).then((res) => (res.ok ? res.json() : null)),
      )

      const songResults = await Promise.all(songPromises)
      const validSongs = songResults.filter((result) => result?.song).map((result) => result.song)

      if (validSongs.length > 0) {
        const tracks = validSongs.map((song: any, index: number) => ({
          id: Number.parseInt(song._id.slice(-6), 16) + index,
          title: song.title,
          artist: song.artistName,
          album: album.title,
          duration: song.duration,
          audioUrl: song.audioUrl,
          image:
            song.imageUrl ||
            album.imageUrl ||
            `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(song.title)}`,
        }))

        playPlaylist(tracks)
      }
    } catch (error) {
      console.error("Error playing album:", error)
    }
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

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Albums</h1>
          <p className="text-gray-400 mb-6">Explore the latest album releases from talented artists</p>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search albums or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
              />
            </div>

            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full md:w-48 bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-full aspect-square bg-gray-700 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Albums Grid */}
        {!loading && (
          <>
            {filteredAlbums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAlbums.map((album) => (
                  <Card
                    key={album._id}
                    className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors group"
                  >
                    <CardContent className="p-6">
                      <div className="relative mb-4">
                        <Link href={`/album/${album._id}`}>
                          <Image
                            src={
                              album.imageUrl ||
                              `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(album.title)}`
                            }
                            alt={album.title}
                            width={200}
                            height={200}
                            className="w-full aspect-square rounded-lg object-cover cursor-pointer"
                          />
                        </Link>
                        <Button
                          size="icon"
                          className="absolute bottom-2 right-2 bg-white text-black hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handlePlayAlbum(album)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Link href={`/album/${album._id}`}>
                          <h3 className="font-semibold truncate hover:underline cursor-pointer">{album.title}</h3>
                        </Link>

                        <Link href={`/artist/${album.artistName.replace(/\s+/g, "-").toLowerCase()}`}>
                          <p className="text-sm text-gray-400 hover:text-white cursor-pointer">{album.artistName}</p>
                        </Link>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(album.releaseDate).getFullYear()}</span>
                          <span>•</span>
                          <span>{album.songs.length} tracks</span>
                        </div>

                        <Badge variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
                          {album.genre}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery || selectedGenre !== "all" ? "No albums found" : "No albums yet"}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery || selectedGenre !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Be the first to upload an album and share your music!"}
                </p>
                {!searchQuery && selectedGenre === "all" && (
                  <Link href="/register">
                    <Button className="bg-white text-black hover:bg-gray-200">Start Creating</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
