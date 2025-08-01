import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = "nekospaces"

async function resetDatabase() {
  let client

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("✅ Connected to MongoDB for reset")

    const db = client.db(DB_NAME)

    // Check if database exists first
    const admin = db.admin()
    const databases = await admin.listDatabases()
    const dbExists = databases.databases.some((database) => database.name === DB_NAME)

    if (!dbExists) {
      console.log(`ℹ️  Database '${DB_NAME}' does not exist - nothing to reset`)
      return
    }

    // List collections before dropping
    const collections = await db.listCollections().toArray()
    console.log(`🔍 Found ${collections.length} collections to remove`)

    if (collections.length === 0) {
      console.log(`ℹ️  Database '${DB_NAME}' is already empty`)
      return
    }

    // Drop each collection individually (safer than dropping entire database)
    for (const collection of collections) {
      try {
        await db.collection(collection.name).drop()
        console.log(`🗑️  Dropped collection: ${collection.name}`)
      } catch (error) {
        console.log(`⚠️  Could not drop collection ${collection.name}: ${error.message}`)
      }
    }

    console.log(`✅ Database '${DB_NAME}' has been reset successfully`)
    console.log("💡 Run 'npm run db:init' to reinitialize with sample data")
  } catch (error) {
    console.error("❌ Error resetting database:", error.message)

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

// Run the reset
resetDatabase().catch((error) => {
  console.error("💥 Fatal error:", error.message)
  process.exit(1)
})
