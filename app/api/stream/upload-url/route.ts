// app/api/stream/upload-url/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileName, fileSize } = await req.json();

  if (!fileName) {
    return NextResponse.json({ error: "fileName required" }, { status: 400 });
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Tus-Resumable": "1.0.0",
        "Upload-Length": String(fileSize || 0),
        "Upload-Metadata": `name ${Buffer.from(fileName).toString("base64")}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json(
      { error: `Cloudflare error: ${error}` },
      { status: 500 },
    );
  }

  const uploadUrl = response.headers.get("Location");
  const videoId = response.headers.get("stream-media-id");

  if (!uploadUrl || !videoId) {
    return NextResponse.json(
      { error: "No upload URL returned from Cloudflare" },
      { status: 500 },
    );
  }

  return NextResponse.json({ uploadUrl, videoId });
}
