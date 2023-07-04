import express, { Request, Response } from "express";
import { District, PreviewInfo, Province, ResponseOrder, Ward } from "../service/checkoutService/types";
import { createOrder, getDistrict, getOrders, getPreviewOrder, getProvince, getWard } from "../service/checkoutService";
import { safeCastUint } from "../utils/utils";
import { auth } from "../middleware/auth";
import { IUser } from "../model/userModel";
import { Err, Ok, Result } from "../utils/result";

const router = express.Router();

interface SubmitOrderFrom {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    province?: string;
    district?: string;
    ward?: string;
    note?: string;
    payment?: string;
}

const getAddressFromIds = async (
    provinceId: string,
    districId: string,
    wardCode: string,
    address: string
): Promise<Result<string, Error>> => {
    const castProvinceResult = safeCastUint(provinceId);
    if (!castProvinceResult.ok) {
        return Err(new Error("Invalid province id"));
    }
    const castedProvinceId = castProvinceResult.data;
    const listProvinces = await getProvince();
    if (!listProvinces.ok) {
        return Err(listProvinces.error);
    }
    const province = listProvinces.data.find((p) => p.id === castedProvinceId);
    if (province === undefined) {
        return Err(new Error("Province not found"));
    }

    const castDistrictResult = safeCastUint(districId);
    if (!castDistrictResult.ok) {
        return Err(new Error("Invalid province id"));
    }
    const castedDistrictId = castDistrictResult.data;
    const listDistricts = await getDistrict(castedProvinceId);
    if (!listDistricts.ok) {
        return Err(listDistricts.error);
    }
    const district = listDistricts.data.find((d) => d.id === castedDistrictId);
    if (district === undefined) {
        return Err(new Error("District not found"));
    }

    const listWards = await getWard(castedDistrictId);
    if (!listWards.ok) {
        return Err(listWards.error);
    }
    const ward = listWards.data.find((w) => w.code === wardCode);
    if (ward === undefined) {
        return Err(new Error("Ward not found"));
    }

    const fullAddress = `${address}, ${ward.name}, ${district.name}, ${province.name}`;
    return Ok(fullAddress);
};

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

router.post(
    "/submit-order",
    auth,
    express.json(),
    async (req: Request<unknown, unknown, SubmitOrderFrom>, res: Response<unknown, { user: IUser }>) => {
        const { name, phone, email, address, payment, province, district, ward, note } = req.body;

        if (
            name === undefined ||
            phone === undefined ||
            email == undefined ||
            address === undefined ||
            payment === undefined ||
            (payment !== "COD" && payment !== "MOMO") ||
            province === undefined ||
            district === undefined ||
            ward === undefined
        ) {
            return res.status(400).send();
        }

        const user = res.locals.user;

        const fullAddress = await getAddressFromIds(province, district, ward, address);

        if (!fullAddress.ok) {
            return res.status(500).send(fullAddress.error.message);
        }

        const result = await createOrder(
            user,
            name,
            phone,
            email,
            address,
            payment,
            district,
            ward,
            fullAddress.data,
            note
        );

        if (!result.ok) {
            console.log(result.error.message);
            return res.status(500).send(result.error.message);
        }

        return res.status(201).send();
    }
);

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
            console.log(result.error.message);
            return res.status(500).send(result.error.message);
        }

        return res.send(result.data);
    }
);

router.get(
    "/orders",
    express.json(),
    auth,
    async (
        req: Request<unknown, unknown, SubmitOrderFrom>,
        res: Response<ResponseOrder[] | string, { user: IUser }>
    ) => {
        const user = res.locals.user;

        const result = await getOrders(user.id);
        if (!result.ok) {
            return res.status(500).send(result.error.message);
        }

        return res.send(result.data);
    }
);

export { router };
