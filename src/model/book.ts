import { Schema, model } from "mongoose";

interface IBook {
  name: string;
  price: number;
}

const bookSchema = new Schema<IBook>({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

export const Book = model<IBook>("Book", bookSchema);
