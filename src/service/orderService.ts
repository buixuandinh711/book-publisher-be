import "dotenv/config";
import { Err, Ok, Result } from "../utils/result";
import { IOrder, Order } from "../model/orderModel";
import { HydratedDocument, Types } from "mongoose";
import { ResponseBookCartItem } from "../utils/type";

export interface ResponseOrder extends Pick<IOrder, "recipientName" | "phone" | "fullAddress" | "createdAt"> {
    total: number;
}

export type ResponseOrderDetail = Omit<IOrder, "updatedAt" | "userId" | "items"> & {
    items: { book: ResponseBookCartItem; quantity: number }[];
};

export const getOrders = async (userId: Types.ObjectId): Promise<Result<ResponseOrder[], Error>> => {
    try {
        const orders = await Order.find<HydratedDocument<ResponseOrder>>(
            { userId },
            "recipientName phone fullAddress createdAt items"
        ).populate<{
            items: { book: { currentPrice: number }; quantity: number }[];
        }>("items.book", "currentPrice");
        const responseOrders = orders.map((order) => {
            const total = order.items.reduce(
                (accumulator, current) => accumulator + current.book.currentPrice * current.quantity,
                0
            );
            return {
                _id: order._id,
                recipientName: order.recipientName,
                phone: order.phone,
                fullAddress: order.fullAddress,
                createdAt: order.createdAt,
                total,
            };
        });

        return Ok(responseOrders);
    } catch (error) {
        return Err(error as Error);
    }
};

export const getOrderById = async (orderId: string): Promise<Result<ResponseOrderDetail, Error>> => {
    try {
        const order = await Order.findById<HydratedDocument<ResponseOrderDetail>>(
            orderId,
            "-updatedAt -userId"
        ).populate<{
            items: { book: ResponseBookCartItem; quantity: number }[];
        }>("items.book", "name id currentPrice");

        if (!order) {
            return Err(new Error("Order not found"));
        }

        const responseOrder: ResponseOrderDetail = {
            _id: order._id,
            recipientName: order.recipientName,
            phone: order.phone,
            fullAddress: order.fullAddress,
            shippingCode: order.shippingCode,
            note: order.note,
            payment: order.payment,
            items: order.items,
            createdAt: order.createdAt,
        };

        return Ok(responseOrder);
    } catch (error) {
        return Err(error as Error);
    }
};
