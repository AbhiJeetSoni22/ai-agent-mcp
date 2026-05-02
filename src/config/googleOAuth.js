import { google } from "googleapis";

const redirectURI = process.env.GOOGLE_REDIRECT_URI;

if (!redirectURI) {
  console.error("❌ GOOGLE_REDIRECT_URI is missing");
  process.exit(1);
}

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  redirectURI
);