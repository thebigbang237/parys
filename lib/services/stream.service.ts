// lib/services/stream.service.ts

export async function getSignedUploadUrl(fileName: string): Promise<{
  uploadUrl: string;
  videoId: string;
}> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Tus-Resumable": "1.0.0",
        "Upload-Length": "0",
        "Upload-Metadata": `name ${Buffer.from(fileName).toString("base64")}`,
      },
    },
  );

  const uploadUrl = response.headers.get("Location")!;
  const videoId = response.headers.get("stream-media-id")!;

  return { uploadUrl, videoId };
}

export async function getSignedPlaybackToken(videoId: string): Promise<string> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exp: Math.floor(Date.now() / 1000) + 14400, // 4 hours
      }),
    },
  );

  const data = await response.json();
  return data.result.token;
}

export async function deleteVideo(videoId: string): Promise<void> {
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
    },
  );
}

export async function getVideoDetails(videoId: string) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
    },
  );
  const data = await response.json();
  return data.result;
}
