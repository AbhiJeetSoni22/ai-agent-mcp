import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    googleId: String,
    email: String,
    name: String,
    access_token: String,
    refresh_token: String,
    expiry_date: Number,
});

export const User = mongoose.model("User", userSchema);