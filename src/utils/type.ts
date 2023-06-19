export interface ReqQueryParams {
    page?: string | string[];
    limit?: string | string[];
    "min-price"?: string | string[];
    "max-price"?: string | string[];
    genre?: string | string[];
}

export interface QueryParams {
    page: number;
    limit: number;
    minPrice?: number;
    maxPrice?: number;
    genre?: string[];
}

export interface PaginatedResult<T> {
    results: T[];
    currentPage: number;
    totalPages: number;
}
