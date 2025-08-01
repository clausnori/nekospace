import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Report, CreateReportData } from "@/lib/models/Report"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.userType !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const targetType = searchParams.get("targetType")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = Number.parseInt(searchParams.get("skip") || "0")

    const db = await getDatabase()
    const collection = db.collection<Report>("reports")

    const filter: any = {}
    if (status) filter.status = status
    if (targetType) filter.targetType = targetType

    const reports = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray()

    const total = await collection.countDocuments(filter)

    return NextResponse.json({
      reports,
      total,
      hasMore: skip + limit < total,
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { targetType, targetId, targetTitle, reason, description } = body

    if (!targetType || !targetId || !reason) {
      return NextResponse.json({ error: "Target type, ID, and reason are required" }, { status: 400 })
    }

    if (!ObjectId.isValid(targetId)) {
      return NextResponse.json({ error: "Invalid target ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<Report>("reports")

    // Prevent duplicate reports from same user on same item
    const existingReport = await collection.findOne({
      reporterId: new ObjectId(user._id),
      targetId: new ObjectId(targetId),
      status: { $in: ["pending", "reviewed"] },
    })

    if (existingReport) {
      return NextResponse.json({ error: "You have already reported this item" }, { status: 400 })
    }

    const reportData: CreateReportData = {
      reporterId: new ObjectId(user._id),
      reporterName: `${user.firstName} ${user.lastName}`,
      targetType,
      targetId: new ObjectId(targetId),
      targetTitle,
      reason,
      description,
    }

    const result = await collection.insertOne({
      ...reportData,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newReport = await collection.findOne({ _id: result.insertedId })
    return NextResponse.json({ report: newReport }, { status: 201 })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}