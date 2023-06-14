import { DEFAULT_PAGE_LIMIT } from "./const";
import { QueryParams } from "./type";

export class ValidateAndExtractError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidateAndExtractError";
    }
}

export const validateAndExtractQuery = (query: QueryParams) => {
    let page = query.page;
    if (page === undefined) {
        page = 1;
    }

    let limit = query.limit;
    if (limit === undefined) {
        limit = DEFAULT_PAGE_LIMIT;
    }

    if (page < 1) {
        throw new ValidateAndExtractError("Invalid page number");
    }

    if (limit < 1 || limit > 100) {
        throw new ValidateAndExtractError("Invalid page limit");
    }

    return {
        page,
        limit,
    };
};
