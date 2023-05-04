import { Model, Schema, model } from "mongoose";

interface IBook {
  name: string;
  image: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  isbn: string;
  category: string;
  author: string;
  publicationYear: number;
  description: string;
  additionProps: {
    name: string;
    value: string;
  }[];
}

interface IBookMethods {
  toClient(): IBook;
}

type BookModel = Model<IBook, {}, IBookMethods>;

const bookSchema = new Schema<IBook, BookModel, IBookMethods>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  discountPrice: { type: Number, required: false },
  discountPercent: { type: Number, required: false },
  isbn: { type: String, required: false },
  category: { type: String, required: true },
  author: { type: String },
  publicationYear: { type: Number },
  description: { type: String },
  additionProps: [
    {
      name: { type: String },
      value: { type: String },
    },
  ],
});

bookSchema.methods.toClient = function (): IBook {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj._id;

  return obj;
};

export const Book = model<IBook, BookModel>("Book", bookSchema);
