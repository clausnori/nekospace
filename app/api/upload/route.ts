import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getCurrentUser } from "@/lib/auth"
import { existsSync } from "fs"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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

    const title = (data.get("title") as string)?.trim()
    const genre = (data.get("genre") as string)?.trim() || "Other"
    const albumTitle = (data.get("albumTitle") as string)?.trim() || ""

    const audioFile = data.get("audioFile") as unknown as File | null
    const imageFile = data.get("imageFile") as unknown as File | null

    if (!title || !audioFile) {
      return NextResponse.json({ error: "Missing title or audio file" }, { status: 400 })
    }

    // === Audio File Validation ===
    const audioTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/flac", "audio/ogg"]
    if (!audioTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: `Invalid audio file type: ${audioFile.type}. Allowed: MP3, WAV, FLAC, OGG.` },
        { status: 400 }
      )
    }
    if (audioFile.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio file too large (max 50MB)" }, { status: 400 })
    }

    // === Optional Image File Validation ===
    if (imageFile) {
      const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
      if (!imageTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { error: `Invalid image file type: ${imageFile.type}. Allowed: JPEG, PNG, WebP.` },
          { status: 400 }
        )
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Image file too large (max 5MB)" }, { status: 400 })
      }
    }

    // === Save File Helper ===
    const saveFile = async (file: File, type: "audio" | "image") => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const timestamp = Date.now()
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const filename = `${user._id}_${timestamp}_${safeName}`
      const uploadDir = join(process.cwd(), "public", "uploads", type)

      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      const filepath = join(uploadDir, filename)
      await writeFile(filepath, buffer)

      return `/uploads/${type}/${filename}`
    }

    const audioUrl = await saveFile(audioFile, "audio")
    const imageUrl = imageFile ? await saveFile(imageFile, "image") : undefined

    // === Save to MongoDB ===
    const db = await getDatabase()
    const songsCollection = db.collection("songs")

    const newSong = {
      title,
      genre,
      artist: new ObjectId(user._id),
      artistName: user.name || "Unknown Artist",
      albumName: albumTitle || undefined,
      audioUrl,
      imageUrl,
      duration: 0, // можно позже заменить после анализа аудио
      lyrics: "",
      plays: 0,
      likes: [],
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const insertResult = await songsCollection.insertOne(newSong)

    return NextResponse.json({
      message: "Song uploaded and saved as draft",
      songId: insertResult.insertedId,
      audioUrl,
      imageUrl,
    })
  } catch (error) {
    console.error("Upload failed:", error)
    return NextResponse.json({ error: "Server error during upload" }, { status: 500 })
  }
}