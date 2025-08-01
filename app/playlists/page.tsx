"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Play, Plus, Search, Heart, Clock, Music, List, Users } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import SearchBar from "@/components/search-bar"

interface Playlist {
  _id: string
  title: string
  description?: string
  ownerName: string
  owner: string
  songs: string[]
  imageUrl?: string
  isPublic: boolean
  followers: string[]
  createdAt: string
  updatedAt: string
}

interface CreatePlaylistData {
  title: string
  description: string
  isPublic: boolean
}

export default function PlaylistsPage() {
  const { user, logout } = useAuth()
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([])
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState<CreatePlaylistData>({
    title: "",
    description: "",
    isPublic: true,
  })

  useEffect(() => {
    fetchPlaylists()
  }, [user])

  const fetchPlaylists = async () => {
    try {
      setLoading(true)

      // Fetch user's playlists if logged in
      if (user) {
        const myPlaylistsResponse = await fetch(`/api/playlists?owner=${user._id}`)
        if (myPlaylistsResponse.ok) {
          const myData = await myPlaylistsResponse.json()
          setMyPlaylists(myData.playlists || [])
        }
      }

      // Fetch public playlists
      const publicResponse = await fetch("/api/playlists?public=true&limit=20")
      if (publicResponse.ok) {
        const publicData = await publicResponse.json()
        setPublicPlaylists(publicData.playlists || [])
      }
    } catch (error) {
      console.error("Error fetching playlists:", error)
    } finally {
      setLoading(false)
    }
  }

  const createPlaylist = async () => {
    if (!user || !newPlaylist.title.trim()) return

    setCreating(true)
    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newPlaylist.title.trim(),
          description: newPlaylist.description.trim(),
          owner: user._id,
          ownerName: `${user.firstName} ${user.lastName}`,
          isPublic: newPlaylist.isPublic,
        }),
      })

      if (response.ok) {
        setCreateDialogOpen(false)
        setNewPlaylist({ title: "", description: "", isPublic: true })
        await fetchPlaylists()
      }
    } catch (error) {
      console.error("Error creating playlist:", error)
    } finally {
      setCreating(false)
    }
  }

  const filteredPublicPlaylists = searchQuery.trim()
    ? publicPlaylists.filter(
        (playlist) =>
          playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          playlist.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          playlist.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : publicPlaylists

  const formatDuration = (trackCount: number) => {
    // Estimate 3.5 minutes per track
    const totalMinutes = Math.round(trackCount * 3.5)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (!user) {
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
                <Link href="/login">
                  <Button>Login</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <List className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h1 className="text-2xl font-bold mb-4">Please log in to view playlists</h1>
            <p className="text-gray-400 mb-6">Create and manage your music collections</p>
            <Link href="/login">
              <Button className="bg-white text-black hover:bg-gray-200">Login</Button>
            </Link>
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
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/discover" className="text-gray-300 hover:text-white transition-colors">
                Discover
              </Link>
              <Link href="/artists" className="text-gray-300 hover:text-white transition-colors">
                Artists
              </Link>
              <Link href="/albums" className="text-gray-300 hover:text-white transition-colors">
                Albums
              </Link>
              <Link href="/playlists" className="text-white font-medium">
                Playlists
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <SearchBar />
              </div>
              <Link href="/profile">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  Profile
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Your Playlists</h1>
            <p className="text-gray-400">Organize your music your way</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-gray-200">
                <Plus className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Playlist Name</Label>
                  <Input
                    id="title"
                    value={newPlaylist.title}
                    onChange={(e) => setNewPlaylist((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="My Awesome Playlist"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newPlaylist.description}
                    onChange={(e) => setNewPlaylist((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your playlist..."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPublic">Make Public</Label>
                    <p className="text-sm text-gray-400">Allow others to discover this playlist</p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={newPlaylist.isPublic}
                    onCheckedChange={(checked) => setNewPlaylist((prev) => ({ ...prev, isPublic: checked }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createPlaylist}
                    disabled={creating || !newPlaylist.title.trim()}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    {creating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-purple-500 cursor-pointer hover:from-purple-500 hover:to-purple-700 transition-colors">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Liked Songs</h3>
              <p className="text-sm opacity-80">{user.likedSongs?.length || 0} songs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-800 border-green-500 cursor-pointer hover:from-green-500 hover:to-green-700 transition-colors">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Recently Played</h3>
              <p className="text-sm opacity-80">Last 50 songs</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500 cursor-pointer hover:from-blue-500 hover:to-blue-700 transition-colors">
            <CardContent className="p-6 text-center">
              <Music className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Discover Weekly</h3>
              <p className="text-sm opacity-80">New for you</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-800 border-orange-500 cursor-pointer hover:from-orange-500 hover:to-orange-700 transition-colors">
            <CardContent className="p-6 text-center">
              <Plus className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-semibold">Create New</h3>
              <p className="text-sm opacity-80">Start fresh</p>
            </CardContent>
          </Card>
        </div>

        {/* My Playlists */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Created by You</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-700 rounded-lg animate-pulse mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPlaylists.map((playlist) => (
                <Link key={playlist._id} href={`/playlist/${playlist._id}`}>
                  <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors group">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
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
                          className="absolute bottom-2 right-2 bg-white text-black hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="font-semibold mb-1 line-clamp-1">{playlist.title}</h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                        {playlist.description || "No description"}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{playlist.songs.length} tracks</span>
                        <span>{formatDuration(playlist.songs.length)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <List className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No Playlists Yet</h3>
              <p className="text-gray-400 mb-6">Create your first playlist to organize your favorite music!</p>
              <Button className="bg-white text-black hover:bg-gray-200" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Playlist
              </Button>
            </div>
          )}
        </section>

        {/* Public Playlists */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Discover Playlists</h2>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-700 rounded-lg animate-pulse mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPublicPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPublicPlaylists.map((playlist) => (
                <Link key={playlist._id} href={`/playlist/${playlist._id}`}>
                  <Card className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-colors group">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
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
                          className="absolute bottom-2 right-2 bg-white text-black hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                      <h3 className="font-semibold mb-1 line-clamp-1">{playlist.title}</h3>
                      <p className="text-sm text-gray-400 mb-2 line-clamp-2">by {playlist.ownerName}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          <span>{playlist.followers.length}</span>
                        </div>
                        <span>{playlist.songs.length} tracks</span>
                      </div>
                      {playlist.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{playlist.description}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {searchQuery ? (
                <>
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2">No playlists found</h3>
                  <p className="text-gray-400 mb-6">No playlists match your search for "{searchQuery}"</p>
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <List className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2">No Public Playlists</h3>
                  <p className="text-gray-400 mb-6">
                    Be the first to create a public playlist and share your music taste!
                  </p>
                  <Button className="bg-white text-black hover:bg-gray-200" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Public Playlist
                  </Button>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
