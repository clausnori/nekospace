import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Song } from "@/lib/models/Song"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid song ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Song>("songs")

    // Increment play count
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: { plays: 1 },
        $set: { updatedAt: new Date() },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Play count updated" })
  } catch (error) {
    console.error("Error updating play count:", error)
    return NextResponse.json({ error: "Failed to update play count" }, { status: 500 })
  }
}
