import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.userType !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDatabase()

    // Get statistics
    const [
      totalUsers,
      totalSongs,
      totalAlbums,
      totalPlaylists,
      pendingVerifications,
      recentUsers,
      topSongs,
      systemStats,
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("songs").countDocuments({ status: "published" }),
      db.collection("albums").countDocuments({ status: "published" }),
      db.collection("playlists").countDocuments(),
      db.collection("users").countDocuments({ userType: "author", verified: false }),
      db.collection("users").find({}).sort({ createdAt: -1 }).limit(10).project({ password: 0 }).toArray(),
      db.collection("songs").find({ status: "published" }).sort({ plays: -1 }).limit(10).toArray(),
      {
        totalPlays: await db
          .collection("songs")
          .aggregate([{ $group: { _id: null, total: { $sum: "$plays" } } }])
          .toArray()
          .then((result) => result[0]?.total || 0),
        averageSongDuration: await db
          .collection("songs")
          .aggregate([{ $group: { _id: null, avg: { $avg: "$duration" } } }])
          .toArray()
          .then((result) => Math.round(result[0]?.avg || 0)),
      },
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSongs,
        totalAlbums,
        totalPlaylists,
        pendingVerifications,
        totalPlays: systemStats.totalPlays,
        averageSongDuration: systemStats.averageSongDuration,
      },
      recentUsers,
      topSongs,
    })
  } catch (error) {
    console.error("Error fetching admin dashboard:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
