import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await request.formData()
    const imageFile = data.get("imageFile") as unknown as File | null

    if (!imageFile) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 })
    }

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

    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const timestamp = Date.now()
    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const filename = `${user._id}_${timestamp}_${safeName}`
    const uploadDir = join(process.cwd(), "public", "artist")

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const imageUrl = `/artist/${filename}`

    return NextResponse.json({ message: "Image uploaded", imageUrl })
  } catch (err) {
    console.error("Image upload failed:", err)
    return NextResponse.json({ error: "Server error during image upload" }, { status: 500 })
  }
}