import express, { Request, Response } from "express";
import { IBook } from "../model/bookModel";
import { DEFAULT_PAGE_LIMIT } from "../utils/const";
import { PaginatedResult, QueryParams } from "../utils/type";
import {
    PageTooLarge,
    countBooksInCategories,
    getAllBooks,
    getBookById,
    getClassicBooks,
    getDiscountBooks,
    getNewBooks,
    getPopularBooks,
    getRelatedBooks,
} from "../service/bookService";
import { ValidateAndExtractError, validateAndExtractQuery } from "../utils/utils";
const router = express.Router();

router.get(
    "/",
    async (req: Request<unknown, unknown, unknown, QueryParams>, res: Response<PaginatedResult<IBook> | string>) => {
        try {
            const { page, limit } = validateAndExtractQuery(req.query);
            const result = await getAllBooks(page, limit);
            return res.status(200).json(result);
        } catch (err) {
            console.log(err);
            if (err instanceof ValidateAndExtractError) {
                return res.status(400).send(err.message);
            }
            if (err instanceof PageTooLarge) {
                return res.status(400).send(err.message);
            }
            return res.status(501).send();
        }
    }
);

router.get(
    "/new",
    async (req: Request<unknown, unknown, unknown, QueryParams>, res: Response<PaginatedResult<IBook> | string>) => {
        try {
            const { page, limit } = validateAndExtractQuery(req.query);
            const result = await getNewBooks(page, limit);
            return res.status(200).json(result);
        } catch (err) {
            console.log(err);
            if (err instanceof ValidateAndExtractError) {
                return res.status(400).send(err.message);
            }
            if (err instanceof PageTooLarge) {
                return res.status(400).send(err.message);
            }
            return res.status(501).send();
        }
    }
);

router.get(
    "/classic",
    async (req: Request<unknown, unknown, unknown, QueryParams>, res: Response<PaginatedResult<IBook> | string>) => {
        try {
            const { page, limit } = validateAndExtractQuery(req.query);
            const result = await getClassicBooks(page, limit);
            if (result === null) {
                return res.status(404).send();
            }
            return res.status(200).json(result);
        } catch (err) {
            console.log(err);
            if (err instanceof ValidateAndExtractError) {
                return res.status(400).send(err.message);
            }
            if (err instanceof PageTooLarge) {
                return res.status(400).send(err.message);
            }
            return res.status(501).send();
        }
    }
);

router.get(
    "/discount",
    async (req: Request<unknown, unknown, unknown, QueryParams>, res: Response<PaginatedResult<IBook> | string>) => {
        try {
            const { page, limit } = validateAndExtractQuery(req.query);
            const result = await getDiscountBooks(page, limit);
            if (result === null) {
                return res.status(404).send();
            }
            return res.status(200).json(result);
        } catch (err) {
            console.log(err);
            if (err instanceof ValidateAndExtractError) {
                return res.status(400).send(err.message);
            }
            if (err instanceof PageTooLarge) {
                return res.status(400).send(err.message);
            }
            return res.status(501).send();
        }
    }
);

router.get(
    "/popular",
    async (req: Request<unknown, unknown, unknown, QueryParams>, res: Response<PaginatedResult<IBook> | string>) => {
        try {
            const { page, limit } = validateAndExtractQuery(req.query);
            const result = await getPopularBooks(page, limit);
            if (result === null) {
                return res.status(404).send();
            }
            return res.status(200).json(result);
        } catch (err) {
            console.log(err);
            if (err instanceof ValidateAndExtractError) {
                return res.status(400).send(err.message);
            }
            if (err instanceof PageTooLarge) {
                return res.status(400).send(err.message);
            }
            return res.status(501).send();
        }
    }
);

router.get(
    "/home",
    async (
        _,
        res: Response<{
            newBooks: IBook[];
            classicBooks: IBook[];
            discountBooks: IBook[];
            popularBooks: IBook[];
        }>
    ) => {
        const page = 1;
        const limit = DEFAULT_PAGE_LIMIT;
        try {
            const newBooksPromise = getNewBooks(page, limit);
            const classicBooksPromise = getClassicBooks(page, limit);
            const discountBooksPromise = getDiscountBooks(page, limit);
            const popularBooksPromise = getPopularBooks(page, limit);

            const results = await Promise.all([
                newBooksPromise,
                classicBooksPromise,
                discountBooksPromise,
                popularBooksPromise,
            ]);

            if (results.some((item) => item === null)) {
                return res.status(404).send();
            }

            const [newBooks, classicBooks, discountBooks, popularBooks] = results as PaginatedResult<IBook>[];

            res.status(200).json({
                newBooks: newBooks.results,
                classicBooks: classicBooks.results,
                discountBooks: discountBooks.results,
                popularBooks: popularBooks.results,
            });
        } catch (_) {
            return res.status(501).send();
        }
    }
);

router.get(
    "/detail/:id",
    async (req: Request<{ id: string }, unknown, unknown, QueryParams>, res: Response<IBook | string>) => {
        const { id } = req.params;

        try {
            const book = await getBookById(id);
            if (book === null) {
                return res.status(404).send(`Book with id '${id}' not found`);
            }
            return res.status(200).json(book);
        } catch (_) {
            return res.status(501).send();
        }
    }
);

router.get(
    "/relate/:id",
    async (req: Request<{ id: string }, unknown, unknown, QueryParams>, res: Response<IBook[] | string>) => {
        try {
            const { id } = req.params;
            const relatedBooks = await getRelatedBooks(id);
            return res.status(200).json(relatedBooks);
        } catch (_) {
            return res.status(501).send();
        }
    }
);

router.get(
    "/category-count",
    async (
        _,
        res: Response<{
            newBooksCount: number;
            classicBooksCount: number;
            discountBooksCount: number;
            popularBooksCount: number;
        }>
    ) => {
        try {
            const bookCount = await countBooksInCategories();
            return res.status(200).json(bookCount);
        } catch (_) {
            return res.status(501).send();
        }
    }
);

export { router };
