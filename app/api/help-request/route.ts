import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  // Log for now — Supabase integration comes in Phase 1.5
  console.log("Help request received:", body);

  return NextResponse.json({ success: true });
}
