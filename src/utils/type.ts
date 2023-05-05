export interface QueryParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  results: T[];
  currentPage: number;
  totalPages: number;
}
