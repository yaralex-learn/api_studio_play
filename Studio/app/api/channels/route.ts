import { NextResponse } from "next/server"
import { channels } from "@/lib/channel-data"

export async function GET() {
  return NextResponse.json({ channels })
}
