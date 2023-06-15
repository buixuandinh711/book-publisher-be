export interface ReqQueryParams {
    page?: string;
    limit?: string;
    "min-price"?: string;
    "max-price"?: string;
}

export interface QueryParams {
    page: number;
    limit: number;
    minPrice?: number;
    maxPrice?: number;
}

export interface PaginatedResult<T> {
    results: T[];
    currentPage: number;
    totalPages: number;
}
