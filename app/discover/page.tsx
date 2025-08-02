"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Clock, Users, Music, AlbumIcon, List } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import SearchBar from "@/components/search-bar"

interface Song {
  _id: string
  title: string
  artistName: string
  albumName?: string
  duration: number
  genre: string
  imageUrl?: string
}

interface Artist {
  _id: string
  firstName: string
  lastName: string
  username: string
  profileImage?: string
  verified: boolean
  stats: {
    totalPlays: number
  }
}

interface Playlist {
  _id: string
  title: string
  description?: string
  ownerName: string
  songs: string[]
  imageUrl?: string
}

export default function DiscoverPage() {
  const { user, logout } = useAuth()
  const [newReleases, setNewReleases] = useState<Song[]>([])
  const [trendingArtists, setTrendingArtists] = useState<Artist[]>([])
  const [featuredAlbums, setFeaturedAlbums] = useState<any[]>([])
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiscoverData()
  }, [])

  const fetchDiscoverData = async () => {
    try {
      const [songsRes, artistsRes, albumsRes, playlistsRes] = await Promise.all([
        fetch("/api/songs?limit=8"),
        fetch("/api/users?userType=author&limit=8"),
        fetch("/api/albums?limit=6"),
        fetch("/api/playlists?public=true&limit=6"),
      ])

      const [songsData, artistsData, albumsData, playlistsData] = await Promise.all([
        songsRes.ok ? songsRes.json() : { songs: [] },
        artistsRes.ok ? artistsRes.json() : { users: [] },
        albumsRes.ok ? albumsRes.json() : { albums: [] },
        playlistsRes.ok ? playlistsRes.json() : { playlists: [] },
      ])

      setNewReleases(songsData.songs || [])
      setTrendingArtists(artistsData.users || [])
      setFeaturedAlbums(albumsData.albums || [])
      setFeaturedPlaylists(playlistsData.playlists || [])
    } catch (error) {
      console.error("Error fetching discover data:", error)
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-xl md:text-2xl font-bold">
              NekoSpaces
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/discover" className="text-white font-medium">
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
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <SearchBar />
              </div>
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/profile">
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
          <div className="md:hidden mt-4">
            <SearchBar />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Hero Section */}
        <section className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Discover Music</h1>
          <p className="text-gray-400 text-base md:text-lg">
            Find your next favorite track from our curated collections
          </p>
        </section>

        {loading ? (
          <div className="space-y-8 md:space-y-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4 md:space-y-6">
                <div className="h-6 md:h-8 bg-gray-700 rounded animate-pulse w-48"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                      <div className="aspect-square bg-gray-700 rounded-lg animate-pulse mb-4"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {/* New Releases */}
            <section>
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Music className="w-5 h-5 md:w-6 md:h-6" />
                <h2 className="text-xl md:text-2xl font-bold">New Releases</h2>
              </div>
              {newReleases.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {newReleases.map((song) => (
                    <Link key={song._id} href={`/song/${song._id}`}>
                      <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors group">
                        <CardContent className="p-3 md:p-4">
                          <div className="relative mb-3 md:mb-4">
                            <Image
                              src={
                                song.imageUrl ||
                                `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(song.title) || "/placeholder.svg"}`
                              }
                              alt={song.title}
                              width={200}
                              height={200}
                              className="w-full aspect-square rounded-lg object-cover"
                            />
                            <Button
                              size="icon"
                              className="absolute bottom-2 right-2 bg-white text-black hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 md:w-10 md:h-10"
                            >
                              <Play className="w-3 h-3 md:w-4 md:h-4" />
                            </Button>
                          </div>
                          <h3 className="font-medium text-sm md:text-base mb-1 truncate">{song.title}</h3>
                          <p className="text-xs md:text-sm text-gray-400 truncate">{song.artistName}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Music}
                  title="No New Releases"
                  description="Check back later for new music releases!"
                />
              )}
            </section>

            {/* Trending Artists */}
            <section>
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <Users className="w-5 h-5 md:w-6 md:h-6" />
                <h2 className="text-xl md:text-2xl font-bold">Trending Artists</h2>
              </div>
              {trendingArtists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {trendingArtists.map((artist) => (
                    <Link key={artist._id} href={`/artist/${artist.username}`}>
                      <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors text-center">
                        <CardContent className="p-4 md:p-6">
                          <div className="relative mb-3 md:mb-4">
                            <Image
                              src={
                                artist.profileImage||`/uploads/image/${artist.profileImage}` ||
                                `/placeholder.svg?height=120&width=120&text=${
                                  encodeURIComponent(artist.firstName + " " + artist.lastName) || "/placeholder.svg"
                                }`
                              }
                              alt={artist.firstName + " " + artist.lastName}
                              width={120}
                              height={120}
                              className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full mx-auto object-cover"
                            />
                          </div>
                          <h3 className="font-medium mb-1 text-sm md:text-base truncate">
                            {artist.firstName} {artist.lastName}
                          </h3>
                          <div className="flex items-center justify-center text-xs text-gray-400">
                            <Users className="w-3 h-3 mr-1" />
                            {formatPlays(artist.stats?.totalPlays || 0)} plays
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Users} title="No Artists Yet" description="Be the first artist to join NekoSpaces!" />
              )}
            </section>

            {/* Featured Albums */}
            <section>
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <AlbumIcon className="w-5 h-5 md:w-6 md:h-6" />
                <h2 className="text-xl md:text-2xl font-bold">Featured Albums</h2>
              </div>
              {featuredAlbums.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {featuredAlbums.map((album) => (
                    <Link key={album._id} href={`/album/${album._id}`}>
                      <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors group">
                        <CardContent className="p-3 md:p-4">
                          <div className="relative mb-3 md:mb-4">
                            <Image
                              src={
                                album.imageUrl ||
                                `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(album.title) || "/placeholder.svg"}`
                              }
                              alt={album.title}
                              width={200}
                              height={200}
                              className="w-full aspect-square rounded-lg object-cover"
                            />
                            <Button
                              size="icon"
                              className="absolute bottom-2 right-2 bg-white text-black hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 md:w-10 md:h-10"
                            >
                              <Play className="w-3 h-3 md:w-4 md:h-4" />
                            </Button>
                          </div>
                          <h3 className="font-medium text-sm md:text-base mb-1 truncate">{album.title}</h3>
                          <p className="text-xs md:text-sm text-gray-400 truncate">{album.artistName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {album.songs.length} track{album.songs.length !== 1 ? "s" : ""}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={AlbumIcon}
                  title="No Albums Yet"
                  description="Albums will appear here once artists start creating them!"
                />
              )}
            </section>

            {/* Featured Playlists */}
            <section>
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <List className="w-5 h-5 md:w-6 md:h-6" />
                <h2 className="text-xl md:text-2xl font-bold">Featured Playlists</h2>
              </div>
              {featuredPlaylists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {featuredPlaylists.map((playlist) => (
                    <Link key={playlist._id} href={`/playlist/${playlist._id}`}>
                      <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors group">
                        <CardContent className="p-3 md:p-4">
                          <div className="relative mb-3 md:mb-4">
                            <Image
                              src={
                                playlist.imageUrl ||
                                `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(playlist.title) || "/placeholder.svg"}`
                              }
                              alt={playlist.title}
                              width={200}
                              height={200}
                              className="w-full aspect-square rounded-lg object-cover"
                            />
                            <Button
                              size="icon"
                              className="absolute bottom-2 right-2 bg-white text-black hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 md:w-10 md:h-10"
                            >
                              <Play className="w-3 h-3 md:w-4 md:h-4" />
                            </Button>
                          </div>
                          <h3 className="font-medium text-sm md:text-base mb-1 truncate">{playlist.title}</h3>
                          <p className="text-xs md:text-sm text-gray-400 truncate">by {playlist.ownerName}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {playlist.songs.length} track{playlist.songs.length !== 1 ? "s" : ""}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={List}
                  title="No Playlists Yet"
                  description="Create the first playlist and share your favorite music!"
                />
              )}
            </section>

            {/* Genres */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Browse by Genre</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {["Electronic", "Ambient", "Synthwave", "Lo-fi", "Chillwave", "Trap"].map((genre) => (
                  <Link key={genre} href={`/genre/${genre.toLowerCase()}`}>
                    <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:from-gray-700 hover:to-gray-800 transition-colors">
                      <CardContent className="p-4 md:p-6 text-center">
                        <h3 className="font-semibold text-sm md:text-base">{genre}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
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
    <div className="text-center py-8 md:py-12">
      <Icon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-600" />
      <h3 className="text-lg md:text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 mb-4 max-w-md mx-auto text-sm md:text-base">{description}</p>
      {action}
    </div>
  )
}
