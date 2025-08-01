import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Song, CreateSongData } from "@/lib/models/Song"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const genre = searchParams.get("genre")
    const artist = searchParams.get("artist")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = Number.parseInt(searchParams.get("skip") || "0")
    const includeUnpublished = searchParams.get("includeUnpublished") === "true"

    const db = await getDatabase()
    const collection = db.collection<Song>("songs")

    // Build filter
    const filter: any = {}

    // Only include published songs by default, unless specifically requested
    if (!includeUnpublished) {
      filter.status = "published"
    }

    if (genre) {
      filter.genre = genre
    }

    if (artist && ObjectId.isValid(artist)) {
      filter.artist = new ObjectId(artist)
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { artistName: { $regex: search, $options: "i" } },
        { genre: { $regex: search, $options: "i" } },
      ]
    }

    const songs = await collection.find(filter).sort({ createdAt: -1 }).limit(limit).skip(skip).toArray()

    const total = await collection.countDocuments(filter)

    return NextResponse.json({
      songs,
      total,
      hasMore: skip + limit < total,
    })
  } catch (error) {
    console.error("Error fetching songs:", error)
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (user.userType !== "author" && user.userType !== "admin") {
      return NextResponse.json({ error: "Author access required" }, { status: 403 })
    }

    const songData: CreateSongData = await request.json()

    // Validate required fields
    if (!songData.title || !songData.audioUrl) {
      return NextResponse.json({ error: "Title and audio URL are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Song>("songs")

    const newSong: Omit<Song, "_id"> = {
      ...songData,
      artist: new ObjectId(user._id),
      artistName: `${user.firstName} ${user.lastName}`,
      plays: 0,
      likes: [],
      status: "draft", // New songs start as drafts
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newSong)
    const createdSong = await collection.findOne({ _id: result.insertedId })

    return NextResponse.json({ song: createdSong }, { status: 201 })
  } catch (error) {
    console.error("Error creating song:", error)
    return NextResponse.json({ error: "Failed to create song" }, { status: 500 })
  }
}
