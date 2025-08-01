import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Comment } from "@/lib/models/Comment"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
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
      // Удалить лайк
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { likes: userId }, $set: { updatedAt: new Date() } }
      )
    } else {
      // Добавить лайк
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $addToSet: { likes: userId }, $set: { updatedAt: new Date() } }
      )
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