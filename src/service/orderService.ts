import "dotenv/config";
import { Err, Ok, Result } from "../utils/result";
import { IOrder, Order } from "../model/orderModel";
import { HydratedDocument, Types } from "mongoose";
import { IBook } from "../model/bookModel";

export interface ResponseOrder extends Omit<IOrder, "items" | "userId" | "updatedAt"> {
    quantity: number;
    total: number;
}

export const getOrders = async (userId: Types.ObjectId): Promise<Result<ResponseOrder[], Error>> => {
    try {
        const orders = await Order.find({ userId }).populate<{
            items: { book: HydratedDocument<IBook>; quantity: number }[];
        }>("items.book");
        const responseOrders = orders.map(toClientOrder);

        return Ok(responseOrders);
    } catch (error) {
        return Err(error as Error);
    }
};

export const getOrderById = async (orderId: string): Promise<Result<ResponseOrder, Error>> => {
    try {
        const order = await Order.findById(orderId).populate<{
            items: { book: HydratedDocument<IBook>; quantity: number }[];
        }>("items.book");

        if (!order) {
            return Err(new Error("Order not found"));
        }

        const responseOrder = toClientOrder(order);

        return Ok(responseOrder);
    } catch (error) {
        return Err(error as Error);
    }
};

type PopulatedOrder = Awaited<
    ReturnType<
        typeof Order.populate<{
            items: { book: HydratedDocument<IBook>; quantity: number }[];
        }>
    >
>;

const toClientOrder = (order: PopulatedOrder) => {
    const quantity = order.items.reduce((accumulator, current) => accumulator + current.quantity, 0);
    const total = order.items.reduce(
        (accumulator, current) => accumulator + current.book.currentPrice * current.quantity,
        0
    );
    const partialOrder = order.toObject() as Partial<IOrder> & Omit<IOrder, "items" | "userId" | "updatedAt">;
    partialOrder.id = partialOrder._id;
    delete partialOrder._id;
    delete partialOrder.__v;
    delete partialOrder.userId;
    delete partialOrder.updatedAt;
    delete partialOrder.items;

    const responseOrder: ResponseOrder = {
        ...partialOrder,
        quantity,
        total,
    };

    return responseOrder;
};
