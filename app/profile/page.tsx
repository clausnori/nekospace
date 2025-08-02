"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Edit, Music, Heart, Clock, Users, Play } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useAudio } from "@/components/audio-provider"
import SearchBar from "@/components/search-bar"

interface Song {
  _id: string
  title: string
  artistName: string
  albumName?: string
  duration: number
  plays: number
  imageUrl?: string
  audioUrl: string
  createdAt: string
}

interface Artist {
  _id: string
  firstName: string
  lastName: string
  username: string
  profileImage?: string
  verified: boolean
  stats?: {
    totalPlays: number
  }
}

interface Playlist {
  _id: string
  title: string
  songs: string[]
  imageUrl?: string
  description?: string
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { playTrack } = useAudio()
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([])
  const [topArtists, setTopArtists] = useState<Artist[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [userStats, setUserStats] = useState({
    totalPlays: 0,
    songsLiked: 0,
    playlistsCreated: 0,
    followingCount: 0,
    followersCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)

      // Fetch user's playlists
      const playlistsResponse = await fetch(`/api/playlists?owner=${user?._id}`)
      if (playlistsResponse.ok) {
        const playlistsData = await playlistsResponse.json()
        setPlaylists(playlistsData.playlists || [])
      }

      // Fetch some recent songs as "recently played" (mock data for now)
      const songsResponse = await fetch("/api/songs?limit=5")
      if (songsResponse.ok) {
        const songsData = await songsResponse.json()
        setRecentlyPlayed(songsData.songs || [])
      }

      // Fetch top artists
      const artistsResponse = await fetch("/api/users?userType=author&limit=3")
      if (artistsResponse.ok) {
        const artistsData = await artistsResponse.json()
        setTopArtists(artistsData.users || [])
      }

      // Calculate user stats
      setUserStats({
        totalPlays: user?.stats?.totalPlays || 0,
        songsLiked: user?.likedSongs?.length || 0,
        playlistsCreated: playlists.length,
        followingCount: user?.following?.length || 0,
        followersCount: user?.followers?.length || 0,
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
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
      image: song.imageUrl || "/placeholder.svg?height=300&width=300&text=" + encodeURIComponent(song.title),
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
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-gray-200">Login</Button>
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
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
          <div className="relative">
            <Image
              src={
                `/uploads/image/${user.profileImage}`||
                `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(user.firstName + " " + user.lastName) || "/placeholder.svg"}`
              }
              alt={user.firstName + " " + user.lastName}
              width={200}
              height={200}
              className="rounded-full aspect-square object-cover"
            />
            <Button
              size="icon"
              className="absolute bottom-2 right-2 bg-gray-800 hover:bg-gray-700 border-2 border-gray-600"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400">Profile</span>
              {user.verified && <Badge className="bg-blue-600 text-white">Verified</Badge>}
              {user.userType === "author" && <Badge className="bg-green-600 text-white">Author</Badge>}
              {user.userType === "admin" && <Badge className="bg-red-600 text-white">Admin</Badge>}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-xl text-gray-300 mb-4">@{user.username}</p>

            <div className="flex items-center gap-6 mb-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{userStats.followersCount} followers</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{userStats.followingCount} following</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span>{formatPlays(userStats.totalPlays)} plays</span>
              </div>
            </div>

            {user.bio && <p className="text-gray-300 mb-6 max-w-2xl">{user.bio}</p>}

            <div className="flex items-center gap-4">
              <Link href="/settings">
                <Button className="bg-white text-black hover:bg-gray-200">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                Share Profile
              </Button>
              {user.userType === "author" && (
                <Link href="/dashboard">
                  <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800">
              Overview
            </TabsTrigger>
            <TabsTrigger value="playlists" className="data-[state=active]:bg-gray-800">
              Playlists ({playlists.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-gray-800">
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-700 rounded"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-700 rounded"></div>
                              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-700 rounded"></div>
                              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recently Played */}
                <div className="lg:col-span-2">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Recently Played
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentlyPlayed.length > 0 ? (
                        <div className="space-y-3">
                          {recentlyPlayed.map((track) => (
                            <div
                              key={track._id}
                              className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition-colors group cursor-pointer"
                              onClick={() => handlePlaySong(track)}
                            >
                              <div className="relative">
                                <Image
                                  src={
                                    track.imageUrl ||
                                    "/placeholder.svg?height=48&width=48&text=" +
                                      encodeURIComponent(track.title.charAt(0)) ||
                                    "/placeholder.svg"
                                  }
                                  alt={track.title}
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
                                <p className="font-medium">{track.title}</p>
                                <p className="text-sm text-gray-400">{track.artistName}</p>
                              </div>
                              <span className="text-xs text-gray-500">{formatDuration(track.duration)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                          <p className="text-gray-400">No recently played tracks</p>
                          <Link href="/discover">
                            <Button className="mt-4 bg-white text-black hover:bg-gray-200">Discover Music</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Top Artists */}
                <div>
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Top Artists</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {topArtists.length > 0 ? (
                        <div className="space-y-4">
                          {topArtists.map((artist, index) => (
                            <Link key={artist._id} href={`/artist/${artist.username}`}>
                              <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition-colors">
                                <span className="text-gray-400 w-4">{index + 1}</span>
                                <Image
                                  src={
                                    artist.profileImage ||
                                    `/placeholder.svg?height=40&width=40&text=${
                                      encodeURIComponent(artist.firstName + " " + artist.lastName) || "/placeholder.svg"
                                    }`
                                  }
                                  alt={artist.firstName + " " + artist.lastName}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {artist.firstName} {artist.lastName}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {formatPlays(artist.stats?.totalPlays || 0)} plays
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                          <p className="text-gray-400">No artists followed yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="space-y-6">
            {playlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist) => (
                  <Link key={playlist._id} href={`/playlist/${playlist._id}`}>
                    <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors group">
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                          <Image
                            src={
                              playlist.imageUrl ||
                              `/placeholder.svg?height=120&width=120&text=${encodeURIComponent(playlist.title) || "/placeholder.svg"}`
                            }
                            alt={playlist.title}
                            width={120}
                            height={120}
                            className="w-full aspect-square rounded-lg object-cover"
                          />
                          <Button
                            size="icon"
                            className="absolute bottom-2 right-2 bg-white text-black hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                        <h3 className="font-semibold mb-1">{playlist.title}</h3>
                        <p className="text-sm text-gray-400">{playlist.songs.length} tracks</p>
                        {playlist.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{playlist.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold mb-2">No Playlists Yet</h3>
                <p className="text-gray-400 mb-6">Create your first playlist to organize your favorite music!</p>
                <Link href="/playlists">
                  <Button className="bg-white text-black hover:bg-gray-200">Create Playlist</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Listening Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span>Liked {userStats.songsLiked} songs</span>
                    </div>
                    <span className="text-sm text-gray-400">Total</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Music className="w-5 h-5 text-green-500" />
                      <span>Created {userStats.playlistsCreated} playlists</span>
                    </div>
                    <span className="text-sm text-gray-400">Total</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-500" />
                      <span>Following {userStats.followingCount} artists</span>
                    </div>
                    <span className="text-sm text-gray-400">Total</span>
                  </div>
                  {userStats.totalPlays === 0 && userStats.songsLiked === 0 && userStats.playlistsCreated === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">No activity yet. Start listening to music!</p>
                      <Link href="/discover">
                        <Button className="mt-4 bg-white text-black hover:bg-gray-200">Discover Music</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
