import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "nekospaces"

async function checkDatabase() {
  let client

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const db = client.db(DB_NAME)

    // Check if database exists
    const admin = db.admin()
    const databases = await admin.listDatabases()
    const dbExists = databases.databases.some((database) => database.name === DB_NAME)

    if (!dbExists) {
      console.log(`❌ Database '${DB_NAME}' does not exist`)
      console.log("💡 Run 'npm run db:init' to create and initialize the database")
      return
    }

    // Check collections and their document counts
    const collections = ["users", "songs", "albums", "playlists"]

    console.log("\n🔍 === Database Status ===")
    console.log(`📊 Database: ${DB_NAME}`)

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName)
        const count = await collection.countDocuments()
        const indexes = await collection.indexes()

        console.log(`\n📁 ${collectionName.toUpperCase()}:`)
        console.log(`   📄 Documents: ${count}`)
        console.log(`   🔍 Indexes: ${indexes.length}`)

        if (count > 0) {
          const sample = await collection.findOne()
          if (sample) {
            const fields = Object.keys(sample).filter((key) => key !== "_id")
            console.log(`   🏷️  Sample fields: ${fields.slice(0, 5).join(", ")}${fields.length > 5 ? "..." : ""}`)
          }
        }

        // Show some stats for each collection
        if (collectionName === "users" && count > 0) {
          const authorCount = await collection.countDocuments({ userType: "author" })
          const listenerCount = await collection.countDocuments({ userType: "listener" })
          const verifiedCount = await collection.countDocuments({ verified: true })
          console.log(`   👥 Authors: ${authorCount}, Listeners: ${listenerCount}, Verified: ${verifiedCount}`)
        }

        if (collectionName === "songs" && count > 0) {
          const publishedCount = await collection.countDocuments({ status: "published" })
          const draftCount = await collection.countDocuments({ status: "draft" })
          const totalPlaysResult = await collection
            .aggregate([{ $group: { _id: null, total: { $sum: "$plays" } } }])
            .toArray()
          const totalPlays = totalPlaysResult[0]?.total || 0
          console.log(`   🎵 Published: ${publishedCount}, Drafts: ${draftCount}`)
          console.log(`   ▶️  Total plays: ${totalPlays.toLocaleString()}`)
        }

        if (collectionName === "albums" && count > 0) {
          const publishedCount = await collection.countDocuments({ status: "published" })
          const genres = await collection.distinct("genre")
          console.log(`   💿 Published: ${publishedCount}`)
          console.log(`   🎨 Genres: ${genres.join(", ")}`)
        }

        if (collectionName === "playlists" && count > 0) {
          const publicCount = await collection.countDocuments({ isPublic: true })
          const privateCount = await collection.countDocuments({ isPublic: false })
          console.log(`   📋 Public: ${publicCount}, Private: ${privateCount}`)
        }
      } catch (error) {
        console.log(`\n📁 ${collectionName.toUpperCase()}: ❌ Collection does not exist or error occurred`)
        console.log(`   Error: ${error.message}`)
      }
    }

    // Check for any additional collections
    try {
      const allCollections = await db.listCollections().toArray()
      const extraCollections = allCollections
        .map((col) => col.name)
        .filter((name) => !collections.includes(name) && !name.startsWith("system."))

      if (extraCollections.length > 0) {
        console.log(`\n📦 Additional collections: ${extraCollections.join(", ")}`)
      }
    } catch (error) {
      console.log(`\n⚠️  Could not list additional collections: ${error.message}`)
    }

    console.log("\n✅ === Database Check Complete ===\n")

    // Provide helpful suggestions
    const totalCollections = await db.listCollections().toArray()
    if (totalCollections.length === 0) {
      console.log("💡 Database is empty. Run 'npm run db:init' to initialize with sample data.")
    } else {
      console.log("💡 Available commands:")
      console.log("   - npm run db:init    (Initialize database)")
      console.log("   - npm run db:seed    (Add more sample data)")
      console.log("   - npm run db:reset   (Reset database)")
      console.log("   - npm run db:setup   (Complete setup)")
    }
  } catch (error) {
    console.error("❌ Error checking database:", error.message)

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Connection refused. Make sure MongoDB is running and MONGODB_URI is correct.")
      console.log(`   Current URI: ${MONGODB_URI}`)
    }
  } finally {
    if (client) {
      await client.close()
      console.log("🔌 Database connection closed")
    }
  }
}

// Run the check
checkDatabase().catch((error) => {
  console.error("💥 Fatal error:", error.message)
  process.exit(1)
})
