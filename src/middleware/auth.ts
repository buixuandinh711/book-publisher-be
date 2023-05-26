import { Request, Response, NextFunction } from "express";
import { IUser, User } from "../model/userModel";

export const auth = async function (req: Request, res: Response<unknown, { user: IUser }>, next: NextFunction) {
    const userId = req.session.userId;
    if (userId === undefined) {
        return res.status(401).send("Session not found");
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.locals.user = user;
        next();
    } catch (error) {
        return res.status(500).send("Undefined error");
    }
};
