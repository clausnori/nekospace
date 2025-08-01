import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Song } from "@/lib/models/Song"
import type { Album } from "@/lib/models/Album"
import type { User } from "@/lib/models/User"
import type { Playlist } from "@/lib/models/Playlist"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all" // 'songs', 'albums', 'artists', 'playlists', 'all'
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: "Search query must be at least 2 characters" }, { status: 400 })
    }

    const db = await getDatabase()
    const searchRegex = { $regex: query, $options: "i" }

    const results: any = {}

    if (type === "songs" || type === "all") {
      const songs = await db
        .collection<Song>("songs")
        .find({
          status: "published",
          $or: [
            { title: searchRegex },
            { artistName: searchRegex },
            { albumName: searchRegex },
            { genre: searchRegex },
          ],
        })
        .limit(limit)
        .sort({ plays: -1 })
        .toArray()

      results.songs = songs
    }

    if (type === "albums" || type === "all") {
      const albums = await db
        .collection<Album>("albums")
        .find({
          status: "published",
          $or: [{ title: searchRegex }, { artistName: searchRegex }, { genre: searchRegex }],
        })
        .limit(limit)
        .sort({ releaseDate: -1 })
        .toArray()

      results.albums = albums
    }

    if (type === "artists" || type === "all") {
      const artists = await db
        .collection<User>("users")
        .find({
          userType: { $in: ["author", "admin"] },
          verified: true,
          isActive: true,
          $or: [{ firstName: searchRegex }, { lastName: searchRegex }, { username: searchRegex }],
        })
        .project({ password: 0, email: 0 })
        .limit(limit)
        .sort({ "stats.totalPlays": -1 })
        .toArray()

      results.artists = artists
    }

    if (type === "playlists" || type === "all") {
      const playlists = await db
        .collection<Playlist>("playlists")
        .find({
          isPublic: true,
          $or: [{ title: searchRegex }, { description: searchRegex }, { ownerName: searchRegex }],
        })
        .limit(limit)
        .sort({ updatedAt: -1 })
        .toArray()

      results.playlists = playlists
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
