import type { ObjectId } from "mongodb"

export interface Album {
  _id?: ObjectId
  title: string
  artist: ObjectId // Reference to User
  artistName: string // Denormalized for performance
  description?: string
  genre: string
  releaseDate: Date
  imageUrl?: string
  songs: ObjectId[] // Array of Song IDs
  status: "draft" | "published"
  createdAt: Date
  updatedAt: Date
}

export interface CreateAlbumData {
  title: string
  artist: ObjectId
  artistName: string
  description?: string
  genre: string
  releaseDate: Date
  imageUrl?: string
}
