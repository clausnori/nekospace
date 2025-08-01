import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  username: string
  firstName: string
  lastName: string
  password?: string
  bio?: string
  profileImage?: string
  userType: "listener" | "author" | "admin"
  verified: boolean
  followers: ObjectId[]
  following: ObjectId[]
  likedSongs: ObjectId[]
  likedAlbums: ObjectId[]
  likedPlaylists: ObjectId[]
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
  subscription?: {
    type: "free" | "premium" | "pro"
    expiresAt?: Date
    features: string[]
  }
  settings: {
    profilePublic: boolean
    showActivity: boolean
    showPlaylists: boolean
    allowFollows: boolean
    emailNotifications: boolean
    pushNotifications: boolean
    newFollowers: boolean
    playlistUpdates: boolean
    newReleases: boolean
    audioQuality: "low" | "normal" | "high"
    crossfade: boolean
    normalizeVolume: boolean
    theme: "dark" | "light" | "auto"
    language: string
  }
  stats: {
    totalPlays: number
    totalListeningTime: number
    songsUploaded: number
    albumsCreated: number
    playlistsCreated: number
  }
}

export interface CreateUserData {
  email: string
  username: string
  firstName: string
  lastName: string
  password: string
  userType: "listener" | "author"
  bio?: string
}

export interface LoginData {
  email: string
  password: string
}
