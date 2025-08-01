import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Playlist, CreatePlaylistData } from "@/lib/models/Playlist"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = Number.parseInt(searchParams.get("skip") || "0")
    const owner = searchParams.get("owner")
    const isPublic = searchParams.get("public")

    const db = await getDatabase()
    const collection = db.collection<Playlist>("playlists")

    // Build query
    const query: any = {}

    if (owner) {
      query.owner = new ObjectId(owner)
    }

    if (isPublic !== null) {
      query.isPublic = isPublic === "true"
    }

    const playlists = await collection.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).toArray()

    return NextResponse.json({ playlists })
  } catch (error) {
    console.error("Error fetching playlists:", error)
    return NextResponse.json({ error: "Failed to fetch playlists" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePlaylistData = await request.json()

    // Validate required fields
    if (!body.title || !body.owner || !body.ownerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Playlist>("playlists")

    const newPlaylist: Playlist = {
      ...body,
      songs: [],
      followers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newPlaylist)

    return NextResponse.json(
      { message: "Playlist created successfully", playlistId: result.insertedId },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating playlist:", error)
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 })
  }
}
