import { NextResponse } from "next/server";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const { email } = await req.json();
  const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  });
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/unlocked?token=${token}`;

  await resend.emails.send({
    from: "CoverSnap <noreply@coversnapapp.com>",
    to: email,
    subject: "Unlock your CoverSnap access",
    html: `<p>Click to unlock unlimited access:<br/><a href="${link}">${link}</a></p>`,
  });

  return NextResponse.json({ success: true });
}
