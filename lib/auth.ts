import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { getDatabase } from "./mongodb"
import type { User } from "./models/User"
import { ObjectId } from "mongodb"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, 12)
  } catch (error) {
    console.error("Error hashing password:", error)
    throw new Error("Failed to hash password")
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}

export async function createToken(userId: string): Promise<string> {
  try {
    return await new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .setIssuedAt()
      .sign(JWT_SECRET)
  } catch (error) {
    console.error("Error creating token:", error)
    throw new Error("Failed to create token")
  }
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string }
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload) return null

    const db = await getDatabase()
    const user = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(payload.userId) }, { projection: { password: 0 } })

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function setAuthCookie(token: string) {
  try {
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })
  } catch (error) {
    console.error("Error setting auth cookie:", error)
    throw new Error("Failed to set authentication cookie")
  }
}

export async function clearAuthCookie() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")
  } catch (error) {
    console.error("Error clearing auth cookie:", error)
  }
}
