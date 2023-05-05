import { Book } from "./model/book";
import { readFile } from "fs/promises";

const main = async () => {
  const data = await readFile("./out.json", "utf-8");
  const arr = JSON.parse(data);

  try {
    const res = await Book.insertMany(arr, { ordered: false });
    console.log(`Insert ${res.length} items`);
  } catch (error: any) {
    console.log(error);
  }
};

main();
