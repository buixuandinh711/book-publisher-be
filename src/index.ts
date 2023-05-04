import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import { Book } from "./model/book";
import { readFile } from "fs/promises";

const main = async () => {
  const DB_HOST = process.env.DB_HOST || "127.0.0.1";
  const DB_PORT = process.env.DB_PORT || "27017";
  const DB_NAME = process.env.DB_NAME;
  await mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);

  const data = await readFile("./out.json", "utf-8");
  const arr = JSON.parse(data);

  await Book.insertMany(arr);

  const SERVER_PORT = process.env.SERVER_PORT || 5000;
  const app = express();
  app.listen(SERVER_PORT, () => {
    console.log("Server listening on port", SERVER_PORT);
  });
};

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
