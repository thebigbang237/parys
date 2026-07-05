// scripts/get-google-token.ts
import "dotenv/config";
import { google } from "googleapis";
import * as readline from "readline";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  "urn:ietf:wg:oauth:2.0:oob", // ← no redirect needed, shows code on screen
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/calendar"],
  prompt: "consent",
});

console.log("Open this URL:\n", authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPaste the code from the page: ", async (code) => {
  const { tokens } = await oauth2Client.getToken(code.trim());
  console.log("\n✅ REFRESH TOKEN:", tokens.refresh_token);
  console.log("\nAdd this to your .env:");
  console.log(`GOOGLE_CALENDAR_REFRESH_TOKEN="${tokens.refresh_token}"`);
  rl.close();
});
