// lib/services/pawapay.service.ts
import { v4 as uuidv4 } from "uuid";

const PAWAPAY_BASE_URL =
  process.env.PAWAPAY_SANDBOX === "true"
    ? "https://api.sandbox.pawapay.io"
    : "https://api.pawapay.io";

export interface PawaPayDepositParams {
  amount: number;
  currency: string;
  phoneNumber: string;
  country: string;
  provider: string; // exact code from active-conf e.g. "MTN_MOMO_CMR"
  description: string;
}

export interface PawaPayDepositResult {
  depositId: string;
  status: "ACCEPTED" | "REJECTED";
  failureReason?: string;
}

export async function createDeposit(
  params: PawaPayDepositParams,
): Promise<PawaPayDepositResult> {
  const depositId = uuidv4();

  const body = {
    depositId,
    amount: String(Math.round(params.amount)),
    currency: params.currency,
    payer: {
      type: "MMO",
      accountDetails: {
        phoneNumber: params.phoneNumber,
        provider: params.provider, // exact code — no more hardcoded mapping
      },
    },
  };

  console.log("PawaPay request:", JSON.stringify(body, null, 2));

  const response = await fetch(`${PAWAPAY_BASE_URL}/v2/deposits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAWAPAY_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log("PawaPay response:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return {
    depositId,
    status: data.status === "ACCEPTED" ? "ACCEPTED" : "REJECTED",
  };
}

export async function getDepositStatus(depositId: string) {
  const response = await fetch(`${PAWAPAY_BASE_URL}/v2/deposits/${depositId}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAWAPAY_API_TOKEN}`,
    },
  });
  const data = await response.json();
  // API returns array or single object depending on version
  return Array.isArray(data) ? data[0] : data;
}

export function verifyWebhookSignature(
  body: string,
  signature: string | null,
): boolean {
  if (!signature || !process.env.PAWAPAY_WEBHOOK_SECRET) return false;
  const crypto = require("crypto");
  const expected = crypto
    .createHmac("sha256", process.env.PAWAPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return signature === expected;
}
