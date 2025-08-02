
import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Album } from "@/lib/models/Album"
import { ObjectId } from "mongodb"


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid album ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Album>("albums")

    const album = await collection.findOne({
      _id: new ObjectId(id),
      status: "published", // Only return published albums
    })

    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    return NextResponse.json({ album })
  } catch (error) {
    console.error("Error fetching album:", error)
    return NextResponse.json({ error: "Failed to fetch album" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid album ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Album>("albums")

    // Remove fields that shouldn't be updated directly
    const { _id, artist, songs, createdAt, ...allowedUpdates } = updates

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
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Album updated successfully" })
  } catch (error) {
    console.error("Error updating album:", error)
    return NextResponse.json({ error: "Failed to update album" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid album ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Album>("albums")

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Album deleted successfully" })
  } catch (error) {
    console.error("Error deleting album:", error)
    return NextResponse.json({ error: "Failed to delete album" }, { status: 500 })
  }
}
