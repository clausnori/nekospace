import type { ObjectId } from "mongodb"

export interface Comment {
  _id?: ObjectId
  songId: ObjectId
  userId: ObjectId
  userName: string
  userAvatar?: string
  content: string
  timestamp: number // Position in song where comment was made (in seconds)
  likes: ObjectId[]
  replies: ObjectId[]
  parentId?: ObjectId // For nested replies
  createdAt: Date
  updatedAt: Date
}

export interface CreateCommentData {
  songId: ObjectId
  userId: ObjectId
  userName: string
  userAvatar?: string
  content: string
  timestamp: number
  parentId?: ObjectId
}
