// app/api/google-calendar/callback/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "No code received" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CALENDAR_CLIENT_ID,
    process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google-calendar/callback`,
  );

  const { tokens } = await oauth2Client.getToken(code);

  // Display the refresh token — copy it from here
  return NextResponse.json({
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token,
    message:
      "Copy the refresh_token and add it to your .env as GOOGLE_CALENDAR_REFRESH_TOKEN",
  });
}
