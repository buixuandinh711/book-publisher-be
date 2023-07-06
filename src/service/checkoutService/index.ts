import "dotenv/config";
import { Err, Ok, Result } from "../../utils/result";
import { redisClient } from "../..";
import { createOrderBody, createPreviewBody } from "./utils";

import { District, GHNResponseData, PaymentMethod, PreviewInfo, Province, Ward } from "./types";
import { Order } from "../../model/orderModel";
import { IUser } from "../../model/userModel";

const GHN_TOKEN_API = process.env.GHN_TOKEN_API;
const GHN_SHOP_ID = process.env.GHN_SHOP_ID;
const GHN_END_POINT = process.env.GHN_END_POINT;

if (GHN_TOKEN_API === undefined || GHN_SHOP_ID === undefined || GHN_END_POINT === undefined) {
    throw new Error("Faild to load GHN env variables");
}

export const getProvince = async (): Promise<Result<Province[], Error>> => {
    try {
        const cachedProvinced = await redisClient.get("province");
        if (cachedProvinced !== null) {
            const provinceData = JSON.parse(cachedProvinced);
            return Ok(provinceData);
        }

        const provinceRes = await fetch(`${GHN_END_POINT}/master-data/province`, {
            headers: {
                "Content-Type": "application/json",
                token: GHN_TOKEN_API,
            },
        });

        if (!provinceRes.ok) {
            throw new Error("Failed to fetch province data");
        }

        const provinceResData: GHNResponseData = await provinceRes.json();
        if (provinceResData.code !== 200 || provinceResData.message !== "Success") {
            throw new Error("Fetched data has failed status");
        }

        const provinceData = provinceResData.data as {
            ProvinceID?: number;
            ProvinceName?: string;
            IsEnable?: 1 | number;
            Status?: 1 | 2;
        }[];

        const transformedData = provinceData
            .filter(
                (data) =>
                    data.Status === 1 &&
                    data.IsEnable === 1 &&
                    data.ProvinceID !== undefined &&
                    data.ProvinceName !== undefined
            )
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .map<Province>((data) => ({ name: data.ProvinceName!, id: data.ProvinceID! }))
            .sort((a, b) => a.name.localeCompare(b.name, "vi"));

        await redisClient.set("province", JSON.stringify(transformedData));

        return Ok(transformedData);
    } catch (error) {
        return Err(error as Error);
    }
};

export const getDistrict = async (provinceId: number): Promise<Result<District[], Error>> => {
    try {
        const cachedDistrict = await redisClient.get(`district:${provinceId}`);
        if (cachedDistrict !== null) {
            const provinceData = JSON.parse(cachedDistrict);
            return Ok(provinceData);
        }

        const districtRes = await fetch(`${GHN_END_POINT}/master-data/district`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                token: GHN_TOKEN_API,
            },
            body: JSON.stringify({
                province_id: provinceId,
            }),
        });

        if (!districtRes.ok) {
            throw new Error("Failed to fetch province data");
        }

        const districtResData: GHNResponseData = await districtRes.json();
        if (districtResData.code !== 200 || districtResData.message !== "Success") {
            throw new Error("Fetched data has failed status");
        }

        const districtData = districtResData.data as {
            DistrictID?: number;
            DistrictName?: string;
            IsEnable?: 1 | number;
            Status?: 1 | 2;
            SupportType?: 0 | 1 | 2 | 3;
        }[];

        const transformedData = districtData
            .filter(
                (data) =>
                    data.Status === 1 &&
                    data.IsEnable === 1 &&
                    data.DistrictID !== undefined &&
                    data.DistrictName !== undefined &&
                    data.SupportType === 3
            )
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .map<District>((data) => ({ name: data.DistrictName!, id: data.DistrictID! }))
            .sort((a, b) => a.name.localeCompare(b.name, "vi"));

        await redisClient.set(`district:${provinceId}`, JSON.stringify(transformedData));

        return Ok(transformedData);
    } catch (error) {
        return Err(error as Error);
    }
};

export const getWard = async (districId: number): Promise<Result<Ward[], Error>> => {
    try {
        const cachedWard = await redisClient.get(`ward:${districId}`);
        if (cachedWard !== null) {
            const provinceData = JSON.parse(cachedWard);
            return Ok(provinceData);
        }

        const wardRes = await fetch(`${GHN_END_POINT}/master-data/ward?district_id`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                token: GHN_TOKEN_API,
            },
            body: JSON.stringify({
                district_id: districId,
            }),
        });

        if (!wardRes.ok) {
            throw new Error("Failed to fetch province data");
        }

        const wardResData: GHNResponseData = await wardRes.json();
        if (wardResData.code !== 200 || wardResData.message !== "Success") {
            throw new Error("Fetched data has failed status");
        }

        const wardData = wardResData.data as {
            WardCode?: string;
            WardName?: string;
            IsEnable?: 1 | number;
            Status?: 1 | 2;
            SupportType?: 0 | 1 | 2 | 3;
        }[];

        const transformedData = wardData
            .filter(
                (data) =>
                    data.Status === 1 &&
                    data.IsEnable === 1 &&
                    data.WardCode !== undefined &&
                    data.WardName !== undefined &&
                    data.SupportType === 3
            )
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .map<Ward>((data) => ({ name: data.WardName!, code: data.WardCode! }))
            .sort((a, b) => a.name.localeCompare(b.name, "vi"));

        await redisClient.set(`ward:${districId}`, JSON.stringify(transformedData));

        return Ok(transformedData);
    } catch (error) {
        return Err(error as Error);
    }
};

export const getPreviewOrder = async (
    toDistrictId: string,
    toWardCode: string,
    quantity: number
): Promise<Result<PreviewInfo, Error>> => {
    const headers = {
        token: GHN_TOKEN_API,
        shop_id: GHN_SHOP_ID,
        "Content-Type": "application/json",
    };

    const body = createPreviewBody(toDistrictId, toWardCode, quantity);

    const endPoint = `${GHN_END_POINT}/v2/shipping-order/preview`;

    const redisKey = `preview-${toDistrictId}-${toWardCode}-${quantity}`;

    try {
        const cachedData = await redisClient.get(redisKey);
        if (cachedData !== null) {
            const parsedData = JSON.parse(cachedData);
            return Ok(parsedData);
        }

        const previewRes = await fetch(endPoint, {
            method: "POST",
            headers,
            body,
        });

        if (!previewRes.ok) {
            throw new Error("Failed to fetch preview data");
        }

        const previewResData: GHNResponseData = await previewRes.json();
        if (previewResData.code !== 200 || previewResData.message !== "Success") {
            throw new Error("Fetched data has failed status");
        }

        const { total_fee, expected_delivery_time } = previewResData.data as {
            total_fee: number;
            expected_delivery_time: string;
        };

        await redisClient.set(
            redisKey,
            JSON.stringify({ shippingFee: total_fee, shippingTime: expected_delivery_time })
        );

        return Ok({ shippingFee: total_fee, shippingTime: expected_delivery_time });
    } catch (error) {
        return Err(error as Error);
    }
};

export const createOrder = async (
    user: IUser,
    name: string,
    phone: string,
    email: string,
    address: string,
    payment: PaymentMethod,
    toDistrictId: string,
    toWardCode: string,
    fullAddress: string,
    note?: string
): Promise<Result<string, Error>> => {
    const headers = {
        token: GHN_TOKEN_API,
        shop_id: GHN_SHOP_ID,
        "Content-Type": "application/json",
    };

    const quantity = user.cart.reduce((accumulator, current) => accumulator + current.quantity, 0);
    const body = createOrderBody(name, phone, address, payment, toDistrictId, toWardCode, quantity, note);

    const endPoint = `${GHN_END_POINT}/v2/shipping-order/create`;

    try {
        const createOrderRes = await fetch(endPoint, {
            method: "POST",
            headers,
            body,
        });

        if (!createOrderRes.ok) {
            throw new Error("Failed to post create order request");
        }

        const createOrderResData: GHNResponseData = await createOrderRes.json();
        if (createOrderResData.code !== 200 || createOrderResData.message !== "Success") {
            throw new Error("Fetched data has failed status");
        }

        const { order_code: shippingCode } = createOrderResData.data as {
            order_code: string;
        };

        const order = new Order({
            userId: user.id,
            recipientName: name,
            phone,
            email,
            fullAddress,
            shippingCode,
            note,
            payment,
            items: user.cart,
        });

        await order.save();

        user.set("cart", []);
        await user.save();

        return Ok(order.id);
    } catch (error) {
        return Err(error as Error);
    }
};