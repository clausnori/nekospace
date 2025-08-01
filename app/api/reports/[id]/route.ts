import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Report } from "@/lib/models/Report"
import { getCurrentUser } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user || user.userType !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid report ID" }, { status: 400 })
    }

    const body = await request.json()
    const { status, adminNotes } = body

    const allowedStatuses = ["pending", "reviewed", "resolved", "dismissed"]
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Report>("reports")

    const updateData: Partial<Report> & { updatedAt: Date } = {
      status,
      updatedAt: new Date(),
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes
    }

    if (["reviewed", "resolved", "dismissed"].includes(status)) {
      updateData.reviewedBy = new ObjectId(user._id)
      updateData.reviewedAt = new Date()
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    const updatedReport = await collection.findOne({ _id: new ObjectId(id) })
    return NextResponse.json({ report: updatedReport })
  } catch (error) {
    console.error("Error updating report:", error)
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 })
  }
}