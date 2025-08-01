import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyPassword, createToken } from "@/lib/auth"
import type { User, LoginData } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const body: LoginData = await request.json()

    if (!body.email || !body.password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const collection = db.collection<User>("users")

    // Найти пользователя
    const user = await collection.findOne({ email: body.email })

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Проверка пароля
    const isValidPassword = await verifyPassword(body.password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Активен ли аккаунт
    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated. Please contact support." }, { status: 403 })
    }

    // Обновление времени входа
    await collection.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
    )

    // Генерация токена
    const token = await createToken(user._id!.toString())

    // Удалить пароль из объекта
    const { password, ...userWithoutPassword } = user

    // Создаём ответ
    const response = NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    })

    // Устанавливаем куку с токеном
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    })

    return response
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 })
  }
}