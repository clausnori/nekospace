import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Comment, CreateCommentData } from "@/lib/models/Comment"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const songId = searchParams.get("songId")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    if (!songId || !ObjectId.isValid(songId)) {
      return NextResponse.json({ error: "Valid song ID is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Comment>("comments")

    const comments = await collection
      .find({
        songId: new ObjectId(songId),
        parentId: { $exists: false }, // Only top-level comments
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray()

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await collection.find({ parentId: comment._id }).sort({ createdAt: 1 }).limit(5).toArray()

        return {
          ...comment,
          replies: replies,
        }
      }),
    )

    const total = await collection.countDocuments({
      songId: new ObjectId(songId),
      parentId: { $exists: false },
    })

    return NextResponse.json({
      comments: commentsWithReplies,
      total,
      hasMore: skip + limit < total,
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
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

    const body = await request.json()
    const { songId, content, timestamp, parentId } = body

    if (!songId || !ObjectId.isValid(songId)) {
      return NextResponse.json({ error: "Valid song ID is required" }, { status: 400 })
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "Comment too long (max 500 characters)" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Comment>("comments")

    const commentData: CreateCommentData = {
      songId: new ObjectId(songId),
      userId: new ObjectId(user._id),
      userName: `${user.firstName} ${user.lastName}`,
      userAvatar: user.avatar,
      content: content.trim(),
      timestamp: timestamp || 0,
      parentId: parentId ? new ObjectId(parentId) : undefined,
    }

    const result = await collection.insertOne({
      ...commentData,
      likes: [],
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newComment = await collection.findOne({ _id: result.insertedId })

    return NextResponse.json({ comment: newComment }, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
