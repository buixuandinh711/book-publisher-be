import { Model, Schema, model } from "mongoose";

export interface IBook {
    id: string;
    name: string;
    image: string;
    originalPrice: number;
    currentPrice: number;
    isbn: string;
    category: string;
    author: string;
    publicationYear: number;
    dimensions: string;
    numPages: number;
    coverType: string;
    description: string;
}

interface IBookMethods {
    toClient(imageWidth: number): IBook;
}

type BookModel = Model<IBook, unknown, IBookMethods>;

const bookSchema = new Schema<IBook, BookModel, IBookMethods>({
    name: { type: String, required: true },
    image: { type: String, required: true },
    originalPrice: { type: Number, required: true, min: [10000, "Too low price"], max: [10000000, "Too high price"] },
    currentPrice: { type: Number, required: false, min: [10000, "Too low price"], max: [10000000, "Too high price"] },
    isbn: { type: String, required: false },
    category: { type: String, required: true },
    author: { type: String, required: true },
    publicationYear: { type: Number, required: false, min: [1800, "Too small year"], max: [2023, "Too large year"] },
    dimensions: { type: String, required: false },
    numPages: { type: Number, required: false, min: [1, "Too few pages"], max: [10000, "Too many pages"] },
    coverType: { type: String, required: false },
    description: { type: String, required: false },
});

bookSchema.methods.toClient = function (imageWidth: number): IBook {
    // replace and remove unused fields
    const obj = this.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;

    // resize image
    obj.image = obj.image.replace("/image/upload/", `/image/upload/w_${imageWidth}/`);

    return obj;
};

export const Book = model<IBook, BookModel>("Book", bookSchema);
