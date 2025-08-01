import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "nekospaces"

async function initializeDatabase() {
  let client

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db(DB_NAME)

    // Check if collections exist and drop them
    try {
      const collections = await db.listCollections().toArray()
      for (const collection of collections) {
        await db.collection(collection.name).drop()
        console.log(`🗑️  Dropped collection: ${collection.name}`)
      }
    } catch (error) {
      console.log("ℹ️  No existing collections to drop")
    }

    // Create collections
    await db.createCollection("users")
    await db.createCollection("songs")
    await db.createCollection("albums")
    await db.createCollection("playlists")

    console.log("📁 Collections created successfully")

    // Create indexes for better performance
    await createIndexes(db)

    // Create admin user only
    await seedAdminUser(db)

    console.log("🎉 Database initialization completed successfully!")
    console.log("📝 Database is ready for production use")
    console.log("👤 Default admin user created - check the logs for credentials")
  } catch (error) {
    console.error("❌ Error initializing database:", error.message)
    throw error
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 Database connection closed")
    }
  }
}

async function createIndexes(db) {
  console.log("📊 Creating indexes...")

  try {
    // Users collection indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("users").createIndex({ userType: 1 })
    await db.collection("users").createIndex({ verified: 1 })
    await db.collection("users").createIndex({ createdAt: -1 })

    // Songs collection indexes
    await db.collection("songs").createIndex({ title: 1 })
    await db.collection("songs").createIndex({ artist: 1 })
    await db.collection("songs").createIndex({ artistName: 1 })
    await db.collection("songs").createIndex({ album: 1 })
    await db.collection("songs").createIndex({ genre: 1 })
    await db.collection("songs").createIndex({ status: 1 })
    await db.collection("songs").createIndex({ plays: -1 })
    await db.collection("songs").createIndex({ createdAt: -1 })
    await db.collection("songs").createIndex(
      {
        title: "text",
        artistName: "text",
        albumName: "text",
      },
      {
        name: "search_index",
      },
    )

    // Albums collection indexes
    await db.collection("albums").createIndex({ title: 1 })
    await db.collection("albums").createIndex({ artist: 1 })
    await db.collection("albums").createIndex({ artistName: 1 })
    await db.collection("albums").createIndex({ genre: 1 })
    await db.collection("albums").createIndex({ status: 1 })
    await db.collection("albums").createIndex({ releaseDate: -1 })
    await db.collection("albums").createIndex({ createdAt: -1 })

    // Playlists collection indexes
    await db.collection("playlists").createIndex({ title: 1 })
    await db.collection("playlists").createIndex({ owner: 1 })
    await db.collection("playlists").createIndex({ isPublic: 1 })
    await db.collection("playlists").createIndex({ updatedAt: -1 })
    await db.collection("playlists").createIndex({ createdAt: -1 })

    console.log("✅ Indexes created successfully")
  } catch (error) {
    console.error("❌ Error creating indexes:", error.message)
    throw error
  }
}

async function seedAdminUser(db) {
  console.log("👤 Creating admin user...")

  try {
    const now = new Date()

    // Generate a random password for admin
    const adminPassword = Math.random().toString(36).slice(-12)
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    const adminUser = {
      email: "admin@nekospaces.com",
      username: "admin",
      firstName: "Admin",
      lastName: "User",
      password: hashedPassword,
      bio: "System Administrator",
      profileImage: "/placeholder.svg?height=200&width=200&text=Admin",
      userType: "admin",
      verified: true,
      followers: [],
      following: [],
      likedSongs: [],
      likedAlbums: [],
      likedPlaylists: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      subscription: {
        type: "pro",
        features: ["all_features"],
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
        audioQuality: "high",
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

    await db.collection("users").insertOne(adminUser)

    console.log("✅ Admin user created successfully")
    console.log("📧 Admin Email: admin@nekospaces.com")
    console.log(`🔑 Admin Password: ${adminPassword}`)
    console.log("⚠️  Please change the admin password after first login!")
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message)
    throw error
  }
}

// Run the initialization
initializeDatabase().catch((error) => {
  console.error("💥 Fatal error:", error.message)
  process.exit(1)
})
