import type { ObjectId } from "mongodb"

export interface Song {
  _id?: ObjectId
  title: string
  artist: ObjectId // Reference to User
  artistName: string // Denormalized for performance
  album?: ObjectId // Reference to Album
  albumName?: string
  duration: number // in seconds
  genre: string
  audioUrl: string
  imageUrl?: string
  lyrics?: string
  plays: number
  likes: ObjectId[] // Array of User IDs who liked this song
  status: "draft" | "published"
  createdAt: Date
  updatedAt: Date
}

export interface CreateSongData {
  title: string
  artist: ObjectId
  artistName: string
  album?: ObjectId
  albumName?: string
  duration: number
  genre: string
  audioUrl: string
  imageUrl?: string
  lyrics?: string
}
