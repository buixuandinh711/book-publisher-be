import { DEFAULT_PAGE_LIMIT } from "./const";
import { Result, Ok, Err } from "./result";
import { QueryParams, ReqQueryParams } from "./type";

const safeCastUint = (value: string): Result<number, Error> => {
    const result = Number(value);

    if (isNaN(result) || !Number.isSafeInteger(result) || result < 0) {
        return Err(new Error("Invalid unsigned integer value"));
    }

    return Ok(result);
};

export const validateAndExtractQuery = (query: ReqQueryParams): Result<QueryParams, Error> => {
    const queryParams: QueryParams = { page: 1, limit: DEFAULT_PAGE_LIMIT };
    const { page, limit, "min-price": minPrice, "max-price": maxPrice, genre } = query;

    if (page !== undefined && typeof page === "string") {
        const pageResult = safeCastUint(page);
        if (!pageResult.ok) {
            return Err(pageResult.error);
        }
        queryParams.page = pageResult.data;
    }

    if (limit !== undefined && typeof limit === "string") {
        const limitResult = safeCastUint(limit);
        if (!limitResult.ok) {
            return Err(limitResult.error);
        }
        queryParams.limit = limitResult.data;
    }

    if (queryParams.limit > 100) {
        return Err(new Error("Page limit too large"));
    }

    if (minPrice !== undefined && typeof minPrice === "string") {
        const minPriceResult = safeCastUint(minPrice);
        if (!minPriceResult.ok) {
            return Err(minPriceResult.error);
        }
        queryParams.minPrice = minPriceResult.data;
    }

    if (maxPrice !== undefined && typeof maxPrice === "string") {
        const maxPriceResult = safeCastUint(maxPrice);
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

    if (genre !== undefined) {
        if (typeof genre === "string") {
            queryParams.genre = [genre];
        } else {
            queryParams.genre = genre.sort();
        }
    }

    return Ok(queryParams);
};
