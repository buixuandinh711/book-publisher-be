import { Schema, Types, model } from "mongoose";
import { CartItemSchema, ICartItem } from "./cartSchema";

export interface IOrder {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    recipientName: string;
    phone: string;
    fullAddress: string;
    shippingCode: string;
    note?: string;
    payment: "COD" | "MOMO";
    items: Types.DocumentArray<ICartItem>;
    createdAt: string;
    updatedAt: string;
}

const OrderSchema = new Schema<IOrder>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipientName: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
            validate: {
                validator: function (email: string) {
                    // Email validation logic
                    const phoneRegex =
                        /^(0|84)(2(0[3-9]|1[0-6|8|9]|2[0-2|5-9]|3[2-9]|4[0-9]|5[1|2|4-9]|6[0-3|9]|7[0-7]|8[0-9]|9[0-4|6|7|9])|3[2-9]|5[5|6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])([0-9]{7})$/;
                    return phoneRegex.test(email);
                },
                message: "Invalid phone number",
            },
        },
        fullAddress: {
            type: String,
            required: true,
        },
        shippingCode: {
            type: String,
            required: true,
        },
        note: {
            type: String,
            required: false,
        },
        payment: {
            type: String,
            enum: ["COD", "MOMO"],
            required: true,
        },
        items: {
            type: [CartItemSchema],
            required: true,
        },
    },
    { timestamps: true }
);

export const Order = model<IOrder>("Order", OrderSchema);
