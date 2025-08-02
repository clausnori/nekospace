"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Users, Music, Verified, Play } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import SearchBar from "@/components/search-bar"

interface Artist {
  _id: string
  firstName: string
  lastName: string
  username: string
  bio?: string
  profileImage?: string
  verified: boolean
  followers: string[]
  following: string[]
  stats?: {
    totalPlays: number
    songsUploaded: number
    albumsCreated: number
  }
  createdAt: string
}

export default function ArtistsPage() {
  const { user, logout } = useAuth()
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])

  useEffect(() => {
    fetchArtists()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredArtists(artists)
    } else {
      const filtered = artists.filter(
        (artist) =>
          artist.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          artist.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          artist.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredArtists(filtered)
    }
  }, [searchQuery, artists])

  const fetchArtists = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users?userType=author&limit=50")

      if (response.ok) {
        const data = await response.json()
        setArtists(data.users || [])
        setFilteredArtists(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching artists:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatPlays = (plays: number) => {
    if (plays >= 1000000) {
      return `${(plays / 1000000).toFixed(1)}M`
    } else if (plays >= 1000) {
      return `${(plays / 1000).toFixed(1)}K`
    }
    return plays.toString()
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Artists</h1>
          <p className="text-gray-400 mb-6">Discover talented musicians and creators on NekoSpaces</p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
            />
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
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Artists Grid */}
        {!loading && (
          <>
            {filteredArtists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArtists.map((artist) => (
                  <Link key={artist._id} href={`/artist/${artist.username}`}>
                    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors group">
                      <CardContent className="p-6">
                        <div className="relative mb-4">
                          <Image
                            src={
                              `/uploads/image/${artist.profileImage}`||
                              `/placeholder.svg?height=200&width=200&text=${
                                encodeURIComponent(artist.firstName + " " + artist.lastName) || "/placeholder.svg"
                              }`
                            }
                            alt={`${artist.firstName} ${artist.lastName}`}
                            width={200}
                            height={200}
                            className="w-full aspect-square rounded-lg object-cover"
                          />
                          <Button
                            size="icon"
                            className="absolute bottom-2 right-2 bg-white text-black hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">
                              {artist.firstName} {artist.lastName}
                            </h3>
                            {artist.verified && <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                          </div>

                          <p className="text-sm text-gray-400">@{artist.username}</p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{artist.followers.length}</span>
                            </div>
                            {artist.stats && (
                              <div className="flex items-center gap-1">
                                <Music className="w-3 h-3" />
                                <span>{formatPlays(artist.stats.totalPlays)}</span>
                              </div>
                            )}
                          </div>

                          {artist.verified && <Badge className="bg-blue-600 text-white text-xs">Verified Artist</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">{searchQuery ? "No artists found" : "No artists yet"}</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery
                    ? `No artists match "${searchQuery}". Try a different search term.`
                    : "Be the first to join as an artist and share your music!"}
                </p>
                {!searchQuery && (
                  <Link href="/register">
                    <Button className="bg-white text-black hover:bg-gray-200">Become an Artist</Button>
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
