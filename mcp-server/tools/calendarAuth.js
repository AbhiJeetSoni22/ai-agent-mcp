// mcp-server/tools/calendarAuth.js
import { google } from "googleapis";
import "dotenv/config"; 


if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("❌ ERROR: GOOGLE_CLIENT_ID is missing from process.env!");
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Create the calendar instance
export const calendar = google.calendar({ version: "v3", auth: oauth2Client });