import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token)
    return NextResponse.json({ error: "Missing token" }, { status: 400 });

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
