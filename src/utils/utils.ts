import { DEFAULT_PAGE_LIMIT } from "./const";
import { Result, Ok, Err } from "./result";
import { QueryParams, ReqQueryParams } from "./type";

const safeCastUint = (value: unknown): Result<number, Error> => {
    const result = Number(value);

    if (isNaN(result) || !Number.isSafeInteger(result) || result < 0) {
        return Err(new Error("Invalid unsigned integer value"));
    }

    return Ok(result);
};

export const validateAndExtractQuery = (query: ReqQueryParams): Result<QueryParams, Error> => {
    const queryParams: QueryParams = { page: 1, limit: DEFAULT_PAGE_LIMIT };
    if (query.page !== undefined) {
        const pageResult = safeCastUint(query.page);
        if (!pageResult.ok) {
            return Err(pageResult.error);
        }
        queryParams.page = pageResult.data;
    }

    if (query.limit !== undefined) {
        const limitResult = safeCastUint(query.limit);
        if (!limitResult.ok) {
            return Err(limitResult.error);
        }
        queryParams.limit = limitResult.data;
    }

    if (queryParams.limit > 100) {
        return Err(new Error("Page limit too large"));
    }

    if (query["min-price"] !== undefined) {
        const minPriceResult = safeCastUint(query["min-price"]);
        if (!minPriceResult.ok) {
            return Err(minPriceResult.error);
        }
        queryParams.minPrice = minPriceResult.data;
    }

    if (query["max-price"] !== undefined) {
        const maxPriceResult = safeCastUint(query["max-price"]);
        if (!maxPriceResult.ok) {
            return Err(maxPriceResult.error);
        }
        queryParams.maxPrice = maxPriceResult.data;
    }

    if (
        queryParams.minPrice !== undefined &&
        queryParams.maxPrice !== undefined &&
        queryParams.minPrice > queryParams.maxPrice
    ) {
        return Err(new Error("minPrice greater than maxPrice"));
    }

    return Ok(queryParams);
};
