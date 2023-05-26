import express, { Request, Response } from "express";
import { IUser, User } from "../model/userModel";
import { auth } from "../middleware/auth";
const router = express.Router();

router.post(
    "/login",
    express.urlencoded({ extended: false }),
    async function (
        req: Request<unknown, unknown, { email?: string; password?: string }>,
        res: Response<{ name: string; email: string } | string>
    ) {
        const { email, password } = req.body;

        if (email === undefined || password === undefined) {
            return res.status(400).send("Not enough values in the request body");
        }

        try {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).send("Email not registered");
            }

            const isMatched = await user.comparePassword(password);

            if (!isMatched) {
                return res.status(401).send("Wrong password");
            }

            req.session.regenerate(function (err) {
                if (err) throw new Error("Unable to regenerate sessesion");

                // store user information in session, typically a user id
                req.session.userId = user.id;

                // save the session before redirection to ensure page
                // load does not happen before session is saved
                req.session.save(function (err) {
                    if (err) throw new Error("Unable to save session");
                    res.send({ name: user.name, email: user.email });
                });
            });
        } catch (error: unknown) {
            return res.status(501).send();
        }
    }
);

router.post(
    "/register",
    express.urlencoded({ extended: false }),
    async function (
        req: Request<unknown, unknown, Partial<IUser>>,
        res: Response<{ name: string; email: string } | string>
    ) {
        const { name, email, password } = req.body;

        if (name === undefined || email === undefined || password === undefined) {
            return res.status(400).send("Not enough values in the request body");
        }

        try {
            const user = await User.findOne({ email });

            if (user) {
                return res.status(409).send("Email is already used");
            }

            const newUser = await User.createUser(name, email, password);

            req.session.userId = newUser.id;
            req.session.save(function (err) {
                if (err) throw new Error("Unable to save sessesion");
                res.status(201).send({ name: newUser.name, email: newUser.email });
            });
        } catch (error: unknown) {
            return res.status(501).send((error as Error).message);
        }
    }
);

router.get(
    "/login-cookie",
    auth,
    async function (_: Request, res: Response<{ name: string; email: string } | string, { user: IUser }>) {
        const user = res.locals.user;
        return res.send({ name: user.name, email: user.email });
    }
);

router.get("/logout", auth, async function (req: Request, res: Response<string, { user: IUser }>) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Failed to destroy session");
        }
        return res.send("Logged out");
    });
});

export { router };
