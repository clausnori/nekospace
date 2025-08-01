import type { ObjectId } from "mongodb"

export interface Report {
  _id?: ObjectId
  reporterId: ObjectId
  reporterName: string
  targetType: "song" | "user" | "comment" | "playlist"
  targetId: ObjectId
  targetTitle?: string
  reason: string
  description?: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  adminNotes?: string
  reviewedBy?: ObjectId
  reviewedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateReportData {
  reporterId: ObjectId
  reporterName: string
  targetType: "song" | "user" | "comment" | "playlist"
  targetId: ObjectId
  targetTitle?: string
  reason: string
  description?: string
}

export const REPORT_REASONS = {
  song: [
    "Copyright infringement",
    "Inappropriate content",
    "Spam or misleading",
    "Hate speech",
    "Violence or harmful content",
    "Adult content",
    "False information",
    "Other",
  ],
  user: ["Harassment or bullying", "Spam account", "Impersonation", "Inappropriate profile", "Hate speech", "Other"],
  comment: ["Harassment or bullying", "Spam", "Hate speech", "Inappropriate content", "Off-topic", "Other"],
  playlist: ["Inappropriate content", "Copyright infringement", "Spam or misleading", "Hate speech", "Other"],
}
