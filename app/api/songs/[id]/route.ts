import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Song } from "@/lib/models/Song"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid song ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Song>("songs")

    const song = await collection.findOne({
      _id: new ObjectId(id),
      status: "published", // Only return published songs
    })

    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    return NextResponse.json({ song })
  } catch (error) {
    console.error("Error fetching song:", error)
    return NextResponse.json({ error: "Failed to fetch song" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid song ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Song>("songs")

    // Remove fields that shouldn't be updated directly
    const { _id, artist, plays, likes, createdAt, ...allowedUpdates } = updates

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...allowedUpdates,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Song updated successfully" })
  } catch (error) {
    console.error("Error updating song:", error)
    return NextResponse.json({ error: "Failed to update song" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid song ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Song>("songs")

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Song deleted successfully" })
  } catch (error) {
    console.error("Error deleting song:", error)
    return NextResponse.json({ error: "Failed to delete song" }, { status: 500 })
  }
}
