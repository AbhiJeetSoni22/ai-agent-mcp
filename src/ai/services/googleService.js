import { google } from "googleapis";
import { oauth2Client } from "../config/googleOAuth.js";
import { User } from "../models/User.js";

export const getAuthClient = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new Error("User not found");

  oauth2Client.setCredentials({
    access_token: user.access_token,
    refresh_token: user.refresh_token,
  });

  return oauth2Client;
};