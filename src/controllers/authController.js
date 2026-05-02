import { oauth2Client } from "../config/googleOAuth.js";
import { User } from "../models/User.js";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { encrypt } from "../utils/crypto.js";


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

    // 🔥 FIX: get existing user first
    const existingUser = await User.findOne({ googleId: data.id });

    // 🔥 Save or update user
    const user = await User.findOneAndUpdate(
      { googleId: data.id },
      {
        email: data.email,
        name: data.name,

        access_token: tokens.access_token
          ? encrypt(tokens.access_token)
          : null,

        refresh_token: tokens.refresh_token
          ? encrypt(tokens.refresh_token)
          : existingUser?.refresh_token || null,

        expiry_date: tokens.expiry_date,
      },
      { upsert: true, returnDocument: "after" } // 🔥 updated
    );

    // 🔐 JWT
    const token = jwt.sign(
      { userId: user.googleId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🍪 Cookie (PRODUCTION SAFE)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    // 🔁 Redirect to frontend
    res.redirect(process.env.FRONTEND_URL);

  } catch (err) {
    console.error("OAuth Error:", err); // 🔥 better logging
    res.status(500).send("OAuth Error");
  }
};