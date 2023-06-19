import express, { Request, Response } from "express";
import { IBook } from "../model/bookModel";
import { DEFAULT_PAGE_LIMIT } from "../utils/const";
import { PaginatedResult, ReqQueryParams } from "../utils/type";
import {
    BookNotFound,
    PageTooLarge,
    countBooksInCategories,
    getAllBooks,
    getBookById,
    getBookGenres,
    getClassicBooks,
    getDiscountBooks,
    getNewBooks,
    getPopularBooks,
    getRelatedBooks,
} from "../service/bookService";
import { validateAndExtractQuery } from "../utils/utils";
import { Err, Ok } from "../utils/result";
import { isValidObjectId } from "mongoose";
const router = express.Router();

router.get(
    "/",
    async (req: Request<unknown, unknown, unknown, ReqQueryParams>, res: Response<PaginatedResult<IBook> | string>) => {
        const queryResult = validateAndExtractQuery(req.query);

        if (queryResult.ok) {
            const result = await getAllBooks(queryResult.data);
            if (result.ok) {
                return res.status(200).json(result.data);
            }
            const error = result.error;
            if (error instanceof PageTooLarge) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send(error.message);
        } else {
            const error = queryResult.error;
            console.log(error);
            return res.status(400).send(error.message);
        }
    }
);

router.get(
    "/new",
    async (req: Request<unknown, unknown, unknown, ReqQueryParams>, res: Response<PaginatedResult<IBook> | string>) => {
        const queryResult = validateAndExtractQuery(req.query);

        if (queryResult.ok) {
            const result = await getNewBooks(queryResult.data);
            if (result.ok) {
                return res.status(200).json(result.data);
            }
            const error = result.error;
            if (error instanceof PageTooLarge) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send(error.message);
        } else {
            const error = queryResult.error;
            console.log(error);
            return res.status(400).send(error.message);
        }
    }
);

router.get(
    "/classic",
    async (req: Request<unknown, unknown, unknown, ReqQueryParams>, res: Response<PaginatedResult<IBook> | string>) => {
        const queryResult = validateAndExtractQuery(req.query);

        if (queryResult.ok) {
            const result = await getClassicBooks(queryResult.data);
            if (result.ok) {
                return res.status(200).json(result.data);
            }
            const error = result.error;
            if (error instanceof PageTooLarge) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send(error.message);
        } else {
            const error = queryResult.error;
            console.log(error);
            return res.status(400).send(error.message);
        }
    }
);

router.get(
    "/discount",
    async (req: Request<unknown, unknown, unknown, ReqQueryParams>, res: Response<PaginatedResult<IBook> | string>) => {
        const queryResult = validateAndExtractQuery(req.query);

        if (queryResult.ok) {
            const result = await getDiscountBooks(queryResult.data);
            if (result.ok) {
                return res.status(200).json(result.data);
            }
            const error = result.error;
            if (error instanceof PageTooLarge) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send(error.message);
        } else {
            const error = queryResult.error;
            console.log(error);
            return res.status(400).send(error.message);
        }
    }
);

router.get(
    "/popular",
    async (req: Request<unknown, unknown, unknown, ReqQueryParams>, res: Response<PaginatedResult<IBook> | string>) => {
        const queryResult = validateAndExtractQuery(req.query);

        if (queryResult.ok) {
            const result = await getPopularBooks(queryResult.data);
            if (result.ok) {
                return res.status(200).json(result.data);
            }
            const error = result.error;
            if (error instanceof PageTooLarge) {
                return res.status(400).send(error.message);
            }
            return res.status(500).send(error.message);
        } else {
            const error = queryResult.error;
            console.log(error);
            return res.status(400).send(error.message);
        }
    }
);

router.get(
    "/home",
    async (
        _,
        res: Response<
            | {
                  newBooks: IBook[];
                  classicBooks: IBook[];
                  discountBooks: IBook[];
                  popularBooks: IBook[];
              }
            | string
        >
    ) => {
        const page = 1;
        const limit = DEFAULT_PAGE_LIMIT;
        try {
            const newBooksPromise = getNewBooks({ page, limit });
            const classicBooksPromise = getClassicBooks({ page, limit });
            const discountBooksPromise = getDiscountBooks({ page, limit });
            const popularBooksPromise = getPopularBooks({ page, limit });

            const results = await Promise.all([
                newBooksPromise,
                classicBooksPromise,
                discountBooksPromise,
                popularBooksPromise,
            ]);

            const foundErr = results.find((result) => !result.ok) as Err;
            if (foundErr) {
                return res.status(500).send(foundErr.error.message);
            }

            const unwrapResults = results.map((results) => (results as Ok<PaginatedResult<IBook>>).data);

            const [newBooks, classicBooks, discountBooks, popularBooks] = unwrapResults;

            res.status(200).json({
                newBooks: newBooks.results,
                classicBooks: classicBooks.results,
                discountBooks: discountBooks.results,
                popularBooks: popularBooks.results,
            });
        } catch (_) {
            return res.status(500).send();
        }
    }
);

router.get(
    "/detail/:id",
    async (req: Request<{ id?: string }, unknown, unknown, ReqQueryParams>, res: Response<IBook | string>) => {
        const { id } = req.params;
        if (id === undefined || !isValidObjectId(id)) {
            return res.status(400).send("Invalid book id");
        }
        const result = await getBookById(id);
        if (!result.ok) {
            const error = result.error;
            res.status(500);
            if (error instanceof BookNotFound) {
                res.status(404);
            }
            return res.send(result.error.message);
        }
        return res.send(result.data);
    }
);

router.get(
    "/relate/:id",
    async (req: Request<{ id: string }, unknown, unknown, ReqQueryParams>, res: Response<IBook[] | string>) => {
        const { id } = req.params;
        if (id === undefined || !isValidObjectId(id)) {
            return res.status(400).send("Invalid book id");
        }
        const result = await getRelatedBooks(id);
        if (!result.ok) {
            const error = result.error;
            res.status(500);
            if (error instanceof BookNotFound) {
                res.status(404);
            }
            return res.send(result.error.message);
        }
        return res.send(result.data);
    }
);

router.get(
    "/category-count",
    async (
        _,
        res: Response<
            | {
                  newBooksCount: number;
                  classicBooksCount: number;
                  discountBooksCount: number;
                  popularBooksCount: number;
              }
            | string
        >
    ) => {
        const result = await countBooksInCategories();
        if (!result.ok) {
            return res.status(500).send(result.error.message);
        }
        return res.json(result.data);
    }
);

router.get("/genres", async (_, res: Response<string[] | string>) => {
    const result = await getBookGenres();
    if (!result.ok) {
        return res.status(500).send(result.error.message);
    }
    return res.json(result.data);
});

export { router };
