import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { User, CreateUserData } from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = Number.parseInt(searchParams.get("skip") || "0")
    const userType = searchParams.get("userType")
    const search = searchParams.get("search")

    const db = await getDatabase()
    const collection = db.collection<User>("users")

    // Build query
    const query: any = {}

    if (userType) {
      query.userType = userType
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ]
    }

    const users = await collection
      .find(query)
      .project({ email: 0 }) // Don't return email addresses
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserData = await request.json()

    // Validate required fields
    if (!body.email || !body.username || !body.firstName || !body.lastName || !body.userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await collection.findOne({
      $or: [{ email: body.email }, { username: body.username }],
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email or username already exists" }, { status: 409 })
    }

    const newUser: User = {
      ...body,
      verified: body.userType === "listener", // Auto-verify listeners, authors need manual verification
      followers: [],
      following: [],
      createdAt: new Date(),
      updatedAt: new Date(),
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
        audioQuality: "high",
        crossfade: true,
        normalizeVolume: true,
        theme: "dark",
        language: "en",
      },
    }

    const result = await collection.insertOne(newUser)

    return NextResponse.json({ message: "User created successfully", userId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
