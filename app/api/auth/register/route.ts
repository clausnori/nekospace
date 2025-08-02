import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth"
import type { User, CreateUserData } from "@/lib/models/User"


export async function POST(request: NextRequest) {
  try {
    const body: CreateUserData = await request.json()

    // Validate required fields
    if (!body.email || !body.username || !body.firstName || !body.lastName || !body.password || !body.userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(body.username)) {
      return NextResponse.json(
        {
          error: "Username must be 3-20 characters long and contain only letters, numbers, and underscores",
        },
        { status: 400 },
      )
    }

    const db = await getDatabase()
    const collection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await collection.findOne({
      $or: [{ email: body.email }, { username: body.username }],
    })

    if (existingUser) {
      return NextResponse.json(
        {
          error: existingUser.email === body.email ? "Email already registered" : "Username already taken",
        },
        { status: 409 },
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password)

    const newUser: User = {
      ...body,
      password: hashedPassword,
      verified: body.userType === "listener", // Auto-verify listeners, authors need manual verification
      followers: [],
      following: [],
      likedSongs: [],
      likedAlbums: [],
      likedPlaylists: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: {
        type: "free",
        features: ["basic_streaming", "playlist_creation"],
      },
      settings: {
        profilePublic: true,
        showActivity: true,
        showPlaylists: true,
        allowFollows: true,
        emailNotifications: true,
        pushNotifications: true,
        newFollowers: true,
        playlistUpdates: true,
        newReleases: true,
        audioQuality: "normal",
        crossfade: true,
        normalizeVolume: true,
        theme: "dark",
        language: "en",
      },
      stats: {
        totalPlays: 0,
        totalListeningTime: 0,
        songsUploaded: 0,
        albumsCreated: 0,
        playlistsCreated: 0,
      },
    }

    const result = await collection.insertOne(newUser)

    // Create JWT token
    const token = await createToken(result.insertedId.toString())

    // Set HTTP-only cookie
    await setAuthCookie(token)

    // Return user data without password
    const { password, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        message: "User created successfully",
        user: { ...userWithoutPassword, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user. Please try again." }, { status: 500 })
  }
}
