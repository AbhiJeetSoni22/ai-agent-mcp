import "dotenv/config";
import readline from "readline";
import { google } from "googleapis";

/*
  This script runs ONLY ONCE
  to generate refresh token
*/

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost",
);

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

// Step 1: Generate URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline", // VERY IMPORTANT (gives refresh token)
  scope: SCOPES,
});

console.log("\nOpen this URL in browser:\n");
console.log(authUrl);
console.log("\nPaste the code here:\n");

// Step 2: Read code from terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Code: ", async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log("\n✅ YOUR REFRESH TOKEN:\n");
    console.log(tokens.refresh_token);

    console.log("\n👉 Save this inside .env as GOOGLE_REFRESH_TOKEN");
  } catch (err) {
    console.error(err);
  }

  rl.close();
});
