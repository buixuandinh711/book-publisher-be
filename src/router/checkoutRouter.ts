import express, { Request, Response } from "express";
import { District, Province, Ward, getDistrict, getProvince, getWard } from "../service/checkoutService";
import { safeCastUint } from "../utils/utils";

const router = express.Router();

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

export { router };
