"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Heart, Share, MoreHorizontal, Users, Music, ArrowLeft, Verified } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useAudio } from "@/components/audio-provider"
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

interface Song {
  _id: string
  title: string
  artistName: string
  albumName?: string
  duration: number
  plays: number
  genre: string
  imageUrl?: string
  audioUrl: string
}

interface Album {
  _id: string
  title: string
  artistName: string
  releaseDate: string
  songs: string[]
  imageUrl?: string
  genre: string
}

export default function ArtistPage({ params }: { params: { username: string } }) {
  const { user, logout } = useAuth()
  const { playTrack, playPlaylist } = useAudio()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    fetchArtistData()
  }, [params.username])

  useEffect(() => {
    if (artist && user) {
      setIsFollowing(artist.followers.includes(user._id!))
    }
  }, [artist, user])

  const fetchArtistData = async () => {
    try {
      setLoading(true)

      // Fetch artist by username
      const artistResponse = await fetch(`/api/users?search=${params.username}&userType=author&limit=1`)

      if (!artistResponse.ok) {
        setError("Artist not found")
        return
      }

      const artistData = await artistResponse.json()
      const foundArtist = artistData.users?.find((u: Artist) => u.username === params.username)

      if (!foundArtist) {
        setError("Artist not found")
        return
      }

      setArtist(foundArtist)

      // Fetch artist's songs
      const songsResponse = await fetch(`/api/songs?artist=${foundArtist._id}&limit=20`)
      if (songsResponse.ok) {
        const songsData = await songsResponse.json()
        setSongs(songsData.songs || [])
      }

      // Fetch artist's albums
      const albumsResponse = await fetch(`/api/albums?artist=${foundArtist._id}&limit=10`)
      if (albumsResponse.ok) {
        const albumsData = await albumsResponse.json()
        setAlbums(albumsData.albums || [])
      }
    } catch (error) {
      console.error("Error fetching artist data:", error)
      setError("Failed to load artist")
    } finally {
      setLoading(false)
    }
  }

  const handlePlaySong = (song: Song) => {
    const track = {
      id: Number.parseInt(song._id.slice(-6), 16),
      title: song.title,
      artist: song.artistName,
      album: song.albumName || "Single",
      duration: song.duration,
      audioUrl: song.audioUrl,
      image: song.imageUrl || `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(song.title)}`,
    }
    playTrack(track)
  }

  const handlePlayAllSongs = () => {
    if (songs.length === 0) return

    const tracks = songs.map((song, index) => ({
      id: Number.parseInt(song._id.slice(-6), 16) + index,
      title: song.title,
      artist: song.artistName,
      album: song.albumName || "Single",
      duration: song.duration,
      audioUrl: song.audioUrl,
      image: song.imageUrl || `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(song.title)}`,
    }))

    playPlaylist(tracks)
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
              <p>Loading artist...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !artist) {
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
              <Link href="/artists">
                <Button className="bg-white text-black hover:bg-gray-200">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse Artists
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

      {/* Artist Hero */}
      <section className="relative py-12 md:py-20 px-4">
        <div className="container mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/artists">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Artists
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative">
              <Image
                src={
                  artist.profileImage ||
                  `/placeholder.svg?height=300&width=300&text=${
                    encodeURIComponent(artist.firstName + " " + artist.lastName) || "/placeholder.svg"
                  }`
                }
                alt={`${artist.firstName} ${artist.lastName}`}
                width={300}
                height={300}
                className="rounded-lg aspect-square object-cover"
              />
              <Button
                size="icon"
                className="absolute bottom-4 right-4 bg-white text-black hover:bg-gray-200 w-16 h-16"
                onClick={handlePlayAllSongs}
                disabled={songs.length === 0}
              >
                <Play className="w-8 h-8" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {artist.verified && <Badge className="bg-blue-600 text-white">Verified</Badge>}
                <span className="text-gray-400">Artist</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {artist.firstName} {artist.lastName}
                {artist.verified && <Verified className="inline w-8 h-8 ml-2 text-blue-500" />}
              </h1>

              <p className="text-xl text-gray-300 mb-6">@{artist.username}</p>

              <div className="flex items-center gap-6 mb-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{artist.followers.length} followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{artist.following.length} following</span>
                </div>
                {artist.stats && (
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    <span>{formatPlays(artist.stats.totalPlays)} total plays</span>
                  </div>
                )}
              </div>

              {artist.bio && <p className="text-gray-300 mb-8 max-w-2xl leading-relaxed">{artist.bio}</p>}

              <div className="flex items-center gap-4">
                <Button
                  className={`${isFollowing ? "bg-gray-600 hover:bg-gray-700" : "bg-white text-black hover:bg-gray-200"}`}
                  disabled={!user}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                  <Heart className="w-4 h-4 mr-2" />
                  Like
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

      {/* Popular Tracks */}
      {songs.length > 0 && (
        <section className="px-4 pb-12">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">Popular Tracks</h2>
            <div className="space-y-2">
              {songs.slice(0, 10).map((song, index) => (
                <Card
                  key={song._id}
                  className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => handlePlaySong(song)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 w-6 text-center">{index + 1}</span>
                      <div className="relative">
                        <Image
                          src={
                            song.imageUrl ||
                            `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(song.title.charAt(0)) || "/placeholder.svg"}`
                          }
                          alt={song.title}
                          width={48}
                          height={48}
                          className="rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{song.title}</p>
                        <div className="text-sm text-gray-400">
                          {song.albumName && (
                            <Link
                              href={`/album/${song.albumName.replace(/\s+/g, "-").toLowerCase()}`}
                              className="hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {song.albumName}
                            </Link>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                        {song.genre}
                      </Badge>
                      <span className="text-gray-400 text-sm">{formatPlays(song.plays)}</span>
                      <span className="text-gray-400 text-sm w-12">{formatDuration(song.duration)}</span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <section className="px-4 pb-20">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">Albums</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <Link key={album._id} href={`/album/${album._id}`}>
                  <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors group">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
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
                          className="absolute bottom-2 right-2 bg-white text-black hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="font-semibold mb-1">{album.title}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(album.releaseDate).getFullYear()} • {album.songs.length} tracks
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {songs.length === 0 && albums.length === 0 && (
        <section className="px-4 pb-20">
          <div className="container mx-auto text-center py-16">
            <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No Music Yet</h3>
            <p className="text-gray-400">
              {artist.firstName} {artist.lastName} hasn't uploaded any music yet.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
