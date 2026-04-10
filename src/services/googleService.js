import { google } from "googleapis";
import { User } from "../models/User.js";
import { decrypt } from "../utils/crypto.js";
export const getGoogleClient = async (userId) => {

const user = await User.findOne({ googleId: userId });
const access_token = user.access_token
  ? decrypt(user.access_token)
  : null;

const refresh_token = user.refresh_token
  ? decrypt(user.refresh_token)
  : null;
if (!user || !user.refresh_token) {
  throw new Error("User not authenticated with Google");
}

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:5000/auth/google/callback"
  );

  oAuth2Client.setCredentials({
    access_token,
    refresh_token
  });

  return oAuth2Client;
};