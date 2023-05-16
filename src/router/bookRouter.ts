import express, { Request, Response } from "express";
import { Book, IBook } from "../model/bookModel";
import { DEFAULT_PAGE_LIMIT, ImageSize } from "../utils/const";
import { PaginatedResult, QueryParams } from "../utils/type";
import {
    getAllBooks,
    getBookById,
    getClassicBooks,
    getDiscountBooks,
    getNewBooks,
    getPopularBooks,
    getRelatedBooks,
} from "../service/bookService";
const router = express.Router();

router.get("/", async (req: Request<{}, {}, {}, QueryParams>, res: Response<PaginatedResult<IBook>>) => {
    const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

    try {
        const result = await getAllBooks({ page, limit });
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(501).send(error.message);
    }
});

router.get("/new", async (req: Request<{}, {}, {}, QueryParams>, res: Response<PaginatedResult<IBook>>) => {
    const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

    try {
        const result = await getNewBooks({ page, limit });
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(501).send(error.message);
    }
});

router.get("/classic", async (req: Request<{}, {}, {}, QueryParams>, res: Response<PaginatedResult<IBook>>) => {
    const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

    try {
        const result = await getClassicBooks({ page, limit });
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(501).send(error.message);
    }
});

router.get("/discount", async (req: Request<{}, {}, {}, QueryParams>, res: Response<PaginatedResult<IBook>>) => {
    const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

    try {
        const result = await getDiscountBooks({ page, limit });
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(501).send(error.message);
    }
});

router.get("/popular", async (req: Request<{}, {}, {}, QueryParams>, res: Response<PaginatedResult<IBook>>) => {
    const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

    try {
        const result = await getPopularBooks({ page, limit });
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(501).send(error.message);
    }
});

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
        try {
            const newBooksPromise = getNewBooks();
            const classicBooksPromise = getClassicBooks();
            const discountBooksPromise = getDiscountBooks();
            const popularBooksPromise = getPopularBooks();

            const [newBooks, classicBooks, discountBooks, popularBooks] = await Promise.all([
                newBooksPromise,
                classicBooksPromise,
                discountBooksPromise,
                popularBooksPromise,
            ]);

            res.status(200).json({
                newBooks: newBooks.results,
                classicBooks: classicBooks.results,
                discountBooks: discountBooks.results,
                popularBooks: popularBooks.results,
            });
        } catch (error: any) {
            return res.status(501).send(error.message);
        }
    }
);

router.get("/detail/:id", async (req: Request<{ id: string }, {}, {}, QueryParams>, res: Response<IBook | string>) => {
    const { id } = req.params;

    try {
        const book = await getBookById(id);
        if (book === null) {
            return res.status(404).send(`Book with id '${id}' not found`);
        }
        return res.status(200).json(book);
    } catch (error: any) {
        return res.status(501).send(error.message);
    }
});

router.get(
    "/relate/:id",
    async (req: Request<{ id: string }, {}, {}, QueryParams>, res: Response<IBook[] | string>) => {
        try {
            const { id } = req.params;
            const relatedBooks = await getRelatedBooks(id);
            return res.status(200).json(relatedBooks);
        } catch (error: any) {
            return res.status(501).send(error.message);
        }
    }
);

export { router };
