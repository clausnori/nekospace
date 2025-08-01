import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Album, CreateAlbumData } from "@/lib/models/Album"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = Number.parseInt(searchParams.get("skip") || "0")
    const artist = searchParams.get("artist")
    const genre = searchParams.get("genre")

    const db = await getDatabase()
    const collection = db.collection<Album>("albums")

    // Build query
    const query: any = { status: "published" }

    if (artist) {
      query.artist = new ObjectId(artist)
    }

    if (genre) {
      query.genre = genre
    }

    const albums = await collection
      .find(query)
      .sort({ releaseDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({ albums })
  } catch (error) {
    console.error("Error fetching albums:", error)
    return NextResponse.json({ error: "Failed to fetch albums" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAlbumData = await request.json()

    // Validate required fields
    if (!body.title || !body.artist || !body.artistName || !body.genre || !body.releaseDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Album>("albums")

    const newAlbum: Album = {
      ...body,
      songs: [],
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newAlbum)

    return NextResponse.json({ message: "Album created successfully", albumId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating album:", error)
    return NextResponse.json({ error: "Failed to create album" }, { status: 500 })
  }
}
