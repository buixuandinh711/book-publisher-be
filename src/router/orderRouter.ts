import express, { Request, Response } from "express";
import { auth } from "../middleware/auth";
import { ResponseOrder, getOrderById, getOrders } from "../service/orderService";
import { IUser } from "../model/userModel";

const router = express.Router();

router.get(
    "/",
    express.json(),
    auth,
    async (req: Request, res: Response<ResponseOrder[] | string, { user: IUser }>) => {
        const user = res.locals.user;

        const result = await getOrders(user.id);
        if (!result.ok) {
            return res.status(500).send(result.error.message);
        }

        return res.send(result.data);
    }
);

router.get(
    "/:id",
    express.json(),
    auth,
    async (req: Request<{ id: string }>, res: Response<ResponseOrder | string, { user: IUser }>) => {
        const { id } = req.params;

        const result = await getOrderById(id);
        if (!result.ok) {
            return res.status(500).send(result.error.message);
        }

        return res.send(result.data);
    }
);

export { router };
