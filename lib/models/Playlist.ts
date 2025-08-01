import type { ObjectId } from "mongodb"

export interface Playlist {
  _id?: ObjectId
  title: string
  description?: string
  owner: ObjectId // Reference to User
  ownerName: string // Denormalized for performance
  songs: ObjectId[] // Array of Song IDs
  imageUrl?: string
  isPublic: boolean
  followers: ObjectId[] // Array of User IDs who follow this playlist
  createdAt: Date
  updatedAt: Date
}

export interface CreatePlaylistData {
  title: string
  description?: string
  owner: ObjectId
  ownerName: string
  isPublic: boolean
  imageUrl?: string
}
