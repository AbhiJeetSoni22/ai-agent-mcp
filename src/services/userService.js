import { User } from "../models/User.js";
import { encrypt } from "../utils/crypto.js";

export const saveGithubToken = async (userId, token) => {
  const encryptedToken = encrypt(token);

  return await User.findOneAndUpdate(
    { googleId: userId },
    { github_token: encryptedToken },
    { new: true }
  );
};