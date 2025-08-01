import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "nekospaces"

async function seedMoreData() {
  let client

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("✅ Connected to MongoDB for additional seeding")

    const db = client.db(DB_NAME)
    const now = new Date()

    // Check if database exists
    const admin = db.admin()
    const databases = await admin.listDatabases()
    const dbExists = databases.databases.some((database) => database.name === DB_NAME)

    if (!dbExists) {
      console.log(`❌ Database '${DB_NAME}' does not exist`)
      console.log("💡 Run 'npm run db:init' first to create the database")
      return
    }

    // Get existing users for references
    const existingUsers = await db.collection("users").find({ userType: "author" }).toArray()

    if (existingUsers.length === 0) {
      console.log("❌ No existing authors found. Please run 'npm run db:init' first.")
      return
    }

    console.log(`🔍 Found ${existingUsers.length} existing authors`)

    // Create more artists
    const newArtists = [
      {
        email: "cosmic@nekospaces.com",
        username: "cosmic_drift",
        firstName: "Cosmic",
        lastName: "Drift",
        bio: "Space ambient and cosmic soundscapes. Journey through the galaxy with ethereal melodies.",
        profileImage: "/placeholder.svg?height=200&width=200&text=Cosmic+Drift",
        userType: "author",
        verified: true,
        followers: [],
        following: [],
        createdAt: now,
        updatedAt: now,
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
      },
      {
        email: "volt@nekospaces.com",
        username: "volt_music",
        firstName: "Volt",
        lastName: "Storm",
        bio: "High-energy electronic music with thunderous beats and electrifying melodies.",
        profileImage: "/placeholder.svg?height=200&width=200&text=Volt",
        userType: "author",
        verified: true,
        followers: [],
        following: [],
        createdAt: now,
        updatedAt: now,
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
      },
      {
        email: "shadow@nekospaces.com",
        username: "shadow_moon",
        firstName: "Shadow",
        lastName: "Moon",
        bio: "Dark ambient and atmospheric music. Exploring the depths of sound and emotion.",
        profileImage: "/placeholder.svg?height=200&width=200&text=Shadow+Moon",
        userType: "author",
        verified: true,
        followers: [],
        following: [],
        createdAt: now,
        updatedAt: now,
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
      },
    ]

    const newArtistResult = await db.collection("users").insertMany(newArtists)
    console.log(`Inserted ${newArtistResult.insertedCount} new artists`)

    const cosmicId = newArtistResult.insertedIds[0]
    const voltId = newArtistResult.insertedIds[1]
    const shadowId = newArtistResult.insertedIds[2]

    // Create more albums
    const newAlbums = [
      {
        title: "Galaxy",
        artist: cosmicId,
        artistName: "Cosmic Drift",
        description: "A sonic journey through the cosmos, featuring ambient textures and celestial melodies.",
        genre: "Chillwave",
        releaseDate: new Date("2023-11-15"),
        imageUrl: "/placeholder.svg?height=400&width=400&text=Galaxy",
        songs: [],
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Thunder",
        artist: voltId,
        artistName: "Volt",
        description: "Electrifying beats and thunderous basslines that will energize your soul.",
        genre: "Electronic",
        releaseDate: new Date("2024-02-01"),
        imageUrl: "/placeholder.svg?height=400&width=400&text=Thunder",
        songs: [],
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Silent Night",
        artist: shadowId,
        artistName: "Shadow Moon",
        description: "Dark ambient compositions that explore the quiet moments between sound and silence.",
        genre: "Ambient",
        releaseDate: new Date("2023-12-20"),
        imageUrl: "/placeholder.svg?height=400&width=400&text=Silent+Night",
        songs: [],
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
    ]

    const newAlbumResult = await db.collection("albums").insertMany(newAlbums)
    console.log(`Inserted ${newAlbumResult.insertedCount} new albums`)

    const galaxyId = newAlbumResult.insertedIds[0]
    const thunderId = newAlbumResult.insertedIds[1]
    const silentNightId = newAlbumResult.insertedIds[2]

    // Create more songs
    const newSongs = [
      {
        title: "Starfall",
        artist: cosmicId,
        artistName: "Cosmic Drift",
        album: galaxyId,
        albumName: "Galaxy",
        duration: 242,
        genre: "Chillwave",
        audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        imageUrl: "/placeholder.svg?height=300&width=300&text=Starfall",
        lyrics: `Stars are falling from the sky
Like diamonds in the night
Cosmic dreams begin to fly
In this celestial light`,
        plays: 1100000,
        likes: [],
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Nebula Dance",
        artist: cosmicId,
        artistName: "Cosmic Drift",
        album: galaxyId,
        albumName: "Galaxy",
        duration: 298,
        genre: "Chillwave",
        audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        imageUrl: "/placeholder.svg?height=300&width=300&text=Nebula+Dance",
        lyrics: `In the nebula's embrace
Colors swirl in cosmic space
Dancing through the galaxy
In perfect harmony`,
        plays: 890000,
        likes: [],
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Electric Storm",
        artist: voltId,
        artistName: "Volt",
        album: thunderId,
        albumName: "Thunder",
        duration: 235,
        genre: "Electronic",
        audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        imageUrl: "/placeholder.svg?height=300&width=300&text=Electric+Storm",
        lyrics: `Lightning strikes across the sky
Thunder rolls and spirits fly
Electric energy flows free
In this storm of ecstasy`,
        plays: 1300000,
        likes: [],
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Power Surge",
        artist: voltId,
        artistName: "Volt",
        album: thunderId,
        albumName: "Thunder",
        duration: 218,
        genre: "Electronic",
        audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        imageUrl: "/placeholder.svg?height=300&width=300&text=Power+Surge",
        lyrics: `Feel the power surge within
Electric dreams about to begin
Voltage rising through the night
Illuminating with pure light`,
        plays: 950000,
        likes: [],
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Whispers in the Dark",
        artist: shadowId,
        artistName: "Shadow Moon",
        album: silentNightId,
        albumName: "Silent Night",
        duration: 315,
        genre: "Ambient",
        audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        imageUrl: "/placeholder.svg?height=300&width=300&text=Whispers",
        lyrics: `Whispers in the darkness call
Shadows dancing on the wall
Silent night embraces all
In this peaceful, gentle fall`,
        plays: 750000,
        likes: [],
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Moonlit Path",
        artist: shadowId,
        artistName: "Shadow Moon",
        album: silentNightId,
        albumName: "Silent Night",
        duration: 267,
        genre: "Ambient",
        audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        imageUrl: "/placeholder.svg?height=300&width=300&text=Moonlit+Path",
        lyrics: `Walking down the moonlit path
Silver light shows the way
Peaceful moments, gentle wrath
Of the ending of the day`,
        plays: 680000,
        likes: [],
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
    ]

    const newSongResult = await db.collection("songs").insertMany(newSongs)
    console.log(`Inserted ${newSongResult.insertedCount} new songs`)

    // Update albums with new song references
    const newSongIds = Object.values(newSongResult.insertedIds)

    await db.collection("albums").updateOne({ _id: galaxyId }, { $set: { songs: [newSongIds[0], newSongIds[1]] } })

    await db.collection("albums").updateOne({ _id: thunderId }, { $set: { songs: [newSongIds[2], newSongIds[3]] } })

    await db.collection("albums").updateOne({ _id: silentNightId }, { $set: { songs: [newSongIds[4], newSongIds[5]] } })

    // Create more listeners
    const newListeners = []
    const firstNames = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William"]
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
    ]

    for (let i = 0; i < 20; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`

      newListeners.push({
        email: `${username}@example.com`,
        username,
        firstName,
        lastName,
        bio: `Music enthusiast who loves discovering new artists and creating playlists.`,
        profileImage: `/placeholder.svg?height=200&width=200&text=${firstName}`,
        userType: "listener",
        verified: true,
        followers: [],
        following: [],
        createdAt: now,
        updatedAt: now,
        settings: {
          profilePublic: true,
          showActivity: true,
          showPlaylists: true,
          allowFollows: true,
          emailNotifications: true,
          pushNotifications: false,
          newFollowers: true,
          playlistUpdates: true,
          newReleases: true,
          audioQuality: "normal",
          crossfade: false,
          normalizeVolume: true,
          theme: "dark",
          language: "en",
        },
      })
    }

    const listenerResult = await db.collection("users").insertMany(newListeners)
    console.log(`Inserted ${listenerResult.insertedCount} new listeners`)

    console.log("Additional data seeded successfully!")
  } catch (error) {
    console.error("Error seeding additional data:", error)
  } finally {
    await client.close()
  }
}

// Run the additional seeding
seedMoreData()
