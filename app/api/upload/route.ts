import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getCurrentUser } from "@/lib/auth"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (user.userType !== "author" && user.userType !== "admin") {
      return NextResponse.json({ error: "Only authors can upload files" }, { status: 403 })
    }

    if (!user.verified) {
      return NextResponse.json({ error: "Account must be verified to upload files" }, { status: 403 })
    }

    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File
    const type = data.get("type") as string // 'audio' | 'image'

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    if (type === "audio") {
      const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/flac", "audio/ogg"]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid audio file type: ${file.type}. Allowed types: MP3, WAV, FLAC, OGG`,
          },
          { status: 400 },
        )
      }
    } else if (type === "image") {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid image file type: ${file.type}. Allowed types: JPEG, PNG, WebP`,
          },
          { status: 400 },
        )
      }
    } else {
      return NextResponse.json({ error: "Invalid file type. Must be 'audio' or 'image'" }, { status: 400 })
    }

    // Check file size (50MB for audio, 5MB for images)
    const maxSize = type === "audio" ? 50 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${type === "audio" ? "50MB" : "5MB"}. Your file is ${Math.round(file.size / 1024 / 1024)}MB`,
        },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()?.toLowerCase()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${user._id}_${timestamp}_${sanitizedName}`

    // Create upload directory
    const uploadDir = join(process.cwd(), "public", "uploads", type)

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Save file
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const fileUrl = `/uploads/${type}/${filename}`

    console.log(`✅ File uploaded successfully: ${fileUrl}`)

    return NextResponse.json({
      message: "File uploaded successfully",
      url: fileUrl,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      {
        error: "Failed to upload file. Please try again.",
      },
      { status: 500 },
    )
  }
}
