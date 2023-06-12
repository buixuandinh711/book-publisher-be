import { Book } from "./model/bookModel";
import { readFile } from "fs/promises";
import mongoose from "mongoose";
import "dotenv/config";

const main = async () => {
    const DB_HOST = process.env.DB_HOST || "127.0.0.1";
    const DB_PORT = process.env.DB_PORT || "27017";
    const DB_NAME = process.env.DB_NAME;
    console.log(DB_NAME);
    await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    const data = await readFile("./data.json", "utf-8");
    const arr = JSON.parse(data);

    console.log("Number of data:", arr.length);

    try {
        const res = await Book.insertMany(arr, { ordered: false });
        console.log(`Insert ${res.length} items`);
    } catch (error: unknown) {
        console.log(error);
    }
};

main();
