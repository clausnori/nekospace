"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Music, Users, Album, List } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SearchResult {
  songs?: any[]
  albums?: any[]
  artists?: any[]
  playlists?: any[]
}

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult>({})
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.length >= 2) {
        performSearch()
      } else {
        setResults({})
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const performSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
        setIsOpen(true)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const hasResults = Object.values(results).some((arr) => arr && arr.length > 0)

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search music, artists, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
        />
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border-gray-800 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-400 mt-2">Searching...</p>
              </div>
            ) : hasResults ? (
              <div className="space-y-4">
                {/* Songs */}
                {results.songs && results.songs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      Songs
                    </h3>
                    <div className="space-y-2">
                      {results.songs.map((song) => (
                        <Link
                          key={song._id}
                          href={`/song/${song._id}`}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Image
                            src={song.imageUrl || "/placeholder.svg?height=40&width=40&text=Song"}
                            alt={song.title}
                            width={40}
                            height={40}
                            className="rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{song.title}</p>
                            <p className="text-sm text-gray-400 truncate">{song.artistName}</p>
                          </div>
                          <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                            {song.genre}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Artists */}
                {results.artists && results.artists.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Artists
                    </h3>
                    <div className="space-y-2">
                      {results.artists.map((artist) => (
                        <Link
                          key={artist._id}
                          href={`/artist/${artist.username}`}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Image
                            src={artist.profileImage || "/placeholder.svg?height=40&width=40&text=Artist"}
                            alt={artist.firstName + " " + artist.lastName}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {artist.firstName} {artist.lastName}
                            </p>
                            <p className="text-sm text-gray-400 truncate">@{artist.username}</p>
                          </div>
                          {artist.verified && <Badge className="bg-blue-600 text-white">Verified</Badge>}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Albums */}
                {results.albums && results.albums.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                      <Album className="w-4 h-4" />
                      Albums
                    </h3>
                    <div className="space-y-2">
                      {results.albums.map((album) => (
                        <Link
                          key={album._id}
                          href={`/album/${album._id}`}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Image
                            src={album.imageUrl || "/placeholder.svg?height=40&width=40&text=Album"}
                            alt={album.title}
                            width={40}
                            height={40}
                            className="rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{album.title}</p>
                            <p className="text-sm text-gray-400 truncate">{album.artistName}</p>
                          </div>
                          <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                            {album.genre}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Playlists */}
                {results.playlists && results.playlists.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
                      <List className="w-4 h-4" />
                      Playlists
                    </h3>
                    <div className="space-y-2">
                      {results.playlists.map((playlist) => (
                        <Link
                          key={playlist._id}
                          href={`/playlist/${playlist._id}`}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Image
                            src={playlist.imageUrl || "/placeholder.svg?height=40&width=40&text=Playlist"}
                            alt={playlist.title}
                            width={40}
                            height={40}
                            className="rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{playlist.title}</p>
                            <p className="text-sm text-gray-400 truncate">by {playlist.ownerName}</p>
                          </div>
                          <span className="text-xs text-gray-500">{playlist.songs.length} tracks</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : query.length >= 2 ? (
              <div className="text-center py-4">
                <p className="text-gray-400">No results found for "{query}"</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
