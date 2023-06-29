import express, { Request, Response } from "express";
import {
    District,
    PreviewInfo,
    Province,
    Ward,
    getDistrict,
    getPreviewOrder,
    getProvince,
    getWard,
} from "../service/checkoutService";
import { safeCastUint } from "../utils/utils";
import { createPreviewBody } from "../service/checkoutService/utils";
import { auth } from "../middleware/auth";
import { IUser } from "../model/userModel";

const router = express.Router();

interface SubmitOrderFrom {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    province?: "";
    district?: "";
    ward?: "";
    note?: "";
    payment?: "";
}

router.get("/province", async (req: Request, res: Response<Province[] | string>) => {
    const result = await getProvince();
    if (!result.ok) {
        return res.status(500).send(result.error.message);
    }
    return res.send(result.data);
});

router.get(
    "/district/:provinceId",
    async (req: Request<{ provinceId?: unknown }>, res: Response<District[] | string>) => {
        const paramProvinceId = req.params.provinceId;

        if (typeof paramProvinceId !== "string") {
            return res.status(400).send("Invalid provinceId");
        }

        const castResult = safeCastUint(paramProvinceId);

        if (!castResult.ok) {
            return res.status(400).send("Invalid provinceId");
        }

        const provinceId = castResult.data;

        const result = await getDistrict(provinceId);
        if (!result.ok) {
            return res.status(500).send(result.error.message);
        }
        return res.send(result.data);
    }
);

router.get("/ward/:districtId", async (req: Request<{ districtId?: unknown }>, res: Response<Ward[] | string>) => {
    const paramDistrictId = req.params.districtId;

    if (typeof paramDistrictId !== "string") {
        return res.status(400).send("Invalid provinceId");
    }

    const castResult = safeCastUint(paramDistrictId);

    if (!castResult.ok) {
        return res.status(400).send("Invalid provinceId");
    }

    const districtId = castResult.data;

    const result = await getWard(districtId);
    if (!result.ok) {
        return res.status(500).send(result.error.message);
    }
    return res.send(result.data);
});

router.post("/submit-order", express.json(), (req: Request<unknown, unknown, SubmitOrderFrom>, res: Response) => {
    return res.send(req.body);
});

router.post(
    "/preview-order",
    express.json(),
    auth,
    async (req: Request<unknown, unknown, SubmitOrderFrom>, res: Response<PreviewInfo | string, { user: IUser }>) => {
        const { district, ward } = req.body;
        if (!district || !ward) {
            return res.status(400).send();
        }

        const user = res.locals.user;
        const quantity = user.cart.reduce((accumulator, current) => accumulator + current.quantity, 0);
        const result = await getPreviewOrder(district, ward, quantity);

        if (!result.ok) {
            return res.status(500).send(result.error.message);
        }

        return res.send(result.data);
    }
);

export { router };
