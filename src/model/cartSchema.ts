import { Schema, Types } from "mongoose";

export interface ICartItem {
    book: Types.ObjectId;
    quantity: number;
}

export const CartItemSchema = new Schema<ICartItem>({
    book: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});
