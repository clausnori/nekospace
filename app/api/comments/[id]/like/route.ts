import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Comment } from "@/lib/models/Comment"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const userId = new ObjectId(user._id)
    const isLiked = comment.likes.some((like) => like.toString() === userId.toString())

    if (isLiked) {
      // Unlike
      await collection.updateOne({ _id: new ObjectId(id) }, { $pull: { likes: userId } })
    } else {
      // Like
      await collection.updateOne({ _id: new ObjectId(id) }, { $addToSet: { likes: userId } })
    }

    const updatedComment = await collection.findOne({ _id: new ObjectId(id) })
    return NextResponse.json({
      comment: updatedComment,
      isLiked: !isLiked,
    })
  } catch (error) {
    console.error("Error toggling comment like:", error)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}
