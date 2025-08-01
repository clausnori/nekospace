import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Comment } from "@/lib/models/Comment"
import { verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id } = params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Comment>("comments")

    const comment = await collection.findOne({ _id: new ObjectId(id) })
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    if (comment.userId.toString() !== user._id && user.userType !== "admin") {
      return NextResponse.json({ error: "Not authorized to edit this comment" }, { status: 403 })
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          content: content.trim(),
          updatedAt: new Date(),
        },
      },
    )

    const updatedComment = await collection.findOne({ _id: new ObjectId(id) })
    return NextResponse.json({ comment: updatedComment })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id } = params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Comment>("comments")

    const comment = await collection.findOne({ _id: new ObjectId(id) })
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    if (comment.userId.toString() !== user._id && user.userType !== "admin") {
      return NextResponse.json({ error: "Not authorized to delete this comment" }, { status: 403 })
    }

    // Delete comment and all its replies
    await collection.deleteMany({
      $or: [{ _id: new ObjectId(id) }, { parentId: new ObjectId(id) }],
    })

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
