import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import { router as bookRouter } from "./router/bookRouter";
import { router as userRouter } from "./router/userRouter";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

// Extend the Express session data with custom properties
declare module "express-session" {
    interface SessionData {
        userId: string;
    }
}

const main = async () => {
    const DB_HOST = process.env.DB_HOST || "127.0.0.1";
    const DB_PORT = process.env.DB_PORT || "27017";
    const DB_NAME = process.env.DB_NAME;
    await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    const SERVER_PORT = process.env.SERVER_PORT || 5000;
    const app = express();
    app.use(
        cors({
            origin: 'http://127.0.0.1:3000',
            credentials: true
        })
    );

    app.use(
        session({
            secret: process.env.SESSION_SECRET || "this is not very secret",
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 30,
            },
            saveUninitialized: false, // don't create session until something stored
            resave: false, //don't save session if unmodified
            store: MongoStore.create({
                client: mongoose.connection.getClient(),
            }),
        })
    );

    app.use("/books", bookRouter);
    app.use("/user", userRouter);
    app.listen(SERVER_PORT, () => {
        console.log("Server listening on port", SERVER_PORT);
    });
};

main().catch((e) => {
    console.log(e);
    process.exit(1);
});
