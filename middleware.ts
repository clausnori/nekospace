import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// Проверка и получение JWT_SECRET из переменной окружения
const secret = process.env.JWT_SECRET
if (!secret) throw new Error("JWT_SECRET is not defined")
const JWT_SECRET = new TextEncoder().encode(secret)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Список публичных маршрутов, не требующих авторизации
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/discover",
    "/artist",
    "/song",
    "/album",
    "/api/songs",
    "/api/albums",
    "/api/users",
    "/api/auth/login",
    "/api/auth/register",
    "/api/search",
  ]

  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Проверка наличия токена
  const token = request.cookies.get("token")?.value

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Верификация JWT с явным указанием алгоритма
    await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    })

    return NextResponse.next()
  } catch (error) {
    console.error("Token verification failed:", error)

    // Невалидный токен — удаляем куку и редиректим на логин
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("token")
    return response
  }
}

// Конфигурация, исключающая служебные маршруты и статические файлы
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|uploads).*)",
  ],
}