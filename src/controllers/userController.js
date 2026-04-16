import { User } from "../models/User.js";

export const getMe = async (req, res) => {
    try {
        const user = await User.findOne({ googleId: req.user.userId });

        res.json({
            id: user.googleId,
            email: user.email,
            name: user.name,
        });
    } catch {
        res.status(401).json(null);
    }
}