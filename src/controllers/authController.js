import { oauth2Client } from "../config/googleOAuth.js";
import { User } from "../models/User.js";
import { google } from "googleapis";

/* 🔹 Step 1: Redirect to Google */
export const googleLogin = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/calendar",
      "openid",
      "email",
      "profile"
    ],
  });

  res.redirect(url);
};

/* 🔹 Step 2: Callback */
export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 🔥 Get user info
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    // 🔥 Save or update user
    const user = await User.findOneAndUpdate(
      { googleId: data.id },
      {
        email: data.email,
        name: data.name,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      },
      { upsert: true, new: true }
    );

    res.send("✅ Login successful!");
  } catch (err) {
    console.log(err);
    res.status(500).send("OAuth Error");
  }
};