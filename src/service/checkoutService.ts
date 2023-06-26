import "dotenv/config";
import { Err, Ok, Result } from "../utils/result";
import { redisClient } from "..";

const GHN_TOKEN_API = process.env.GHN_TOKEN_API;
const GHN_END_POINT = process.env.GHN_END_POINT;

if (GHN_TOKEN_API === undefined || GHN_END_POINT === undefined) {
    throw new Error("Faild to load GHN env variables");
}

export interface Province {
    name: string;
    id: number;
}

export interface District {
    name: string;
    id: number;
}

export interface Ward {
    name: string;
    code: string;
}

interface GHNResponseData {
    code: number;
    message: "Success" | string;
    data?: unknown;
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
            .map<Province>((data) => ({ name: data.ProvinceName!, id: data.ProvinceID! }));

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
            .map<District>((data) => ({ name: data.DistrictName!, id: data.DistrictID! }));

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
            .map<Ward>((data) => ({ name: data.WardName!, code: data.WardCode! }));

        await redisClient.set(`ward:${districId}`, JSON.stringify(transformedData));

        return Ok(transformedData);
    } catch (error) {
        return Err(error as Error);
    }
};
