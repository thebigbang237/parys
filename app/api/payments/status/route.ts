// app/api/payments/status/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const depositId = searchParams.get("depositId");
  const provider = searchParams.get("provider");

  if (!depositId) {
    return NextResponse.json({ error: "depositId required" }, { status: 400 });
  }

  if (provider === "pawapay") {
    const PAWAPAY_BASE_URL =
      process.env.PAWAPAY_SANDBOX === "true"
        ? "https://api.sandbox.pawapay.io"
        : "https://api.pawapay.io";

    const response = await fetch(
      `${PAWAPAY_BASE_URL}/v2/deposits/${depositId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAWAPAY_API_TOKEN}`,
        },
      },
    );

    const data = await response.json();
    console.log("PawaPay status response:", JSON.stringify(data, null, 2));

    // v2 wraps result: { status: "FOUND", data: { status: "COMPLETED", ... } }
    // or returns array: [{ status: "COMPLETED", ... }]
    let depositStatus: string;

    if (data.status === "FOUND" && data.data) {
      depositStatus = data.data.status;
    } else if (Array.isArray(data) && data[0]) {
      depositStatus = data[0].status;
    } else if (data.status && data.status !== "FOUND") {
      depositStatus = data.status;
    } else {
      // Still FOUND wrapper with no inner data yet — still processing
      depositStatus = "PROCESSING";
    }

    return NextResponse.json({ status: depositStatus });
  }

  return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
}
