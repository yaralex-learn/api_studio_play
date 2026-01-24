import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 })
  }

  // In a real app, you would verify the token with your auth service
  // This is just a placeholder
  return NextResponse.json({
    isAuthenticated: true,
    user: {
      id: "user-1",
      name: "Test User",
      email: "user@example.com",
    },
  })
}

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // In a real app, you would validate credentials with your auth service
  // This is just a placeholder
  if (email && password) {
    // Set a cookie for authentication
    const response = NextResponse.json({
      isAuthenticated: true,
      user: {
        id: "user-1",
        name: "Test User",
        email,
      },
    })

    // Set a secure HTTP-only cookie
    response.cookies.set({
      name: "auth-token",
      value: "mock-jwt-token",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return response
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
}

export async function DELETE() {
  // Log out by clearing the auth cookie
  const response = NextResponse.json({ success: true })
  response.cookies.delete("auth-token")
  return response
}
