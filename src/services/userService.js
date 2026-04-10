import { User } from "../models/User.js";

export const saveGithubToken = async (userId, token) => {
  return await User.findOneAndUpdate(
    { googleId: userId },
    { github_token: token },
    { new: true }
  );
};