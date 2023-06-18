import { FilterQuery } from "mongoose";
import { Book, IBook } from "../model/bookModel";
import { ImageSize } from "../utils/const";
import { Err, Ok, Result } from "../utils/result";
import { PaginatedResult, QueryParams } from "../utils/type";

export class PageTooLarge extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PageTooLarge";
    }
}

export class BookNotFound extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BookNotFound";
    }
}

export const getAllBooks = async (queryParams: QueryParams): Promise<Result<PaginatedResult<IBook>, Error>> => {
    const { page, limit, minPrice, maxPrice } = queryParams;

    const filter: FilterQuery<IBook> = {};

    // Add minPrice and maxPrice filters if they are provided
    if (minPrice !== undefined && maxPrice !== undefined) {
        filter.currentPrice = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice !== undefined) {
        filter.currentPrice = { $gte: minPrice };
    } else if (maxPrice !== undefined) {
        filter.currentPrice = { $lte: maxPrice };
    }

    let count;

    try {
        count = await Book.countDocuments(filter);
    } catch (error) {
        return Err(error as Error);
    }

    const totalPages = Math.ceil(count / limit);
    if (page > totalPages) {
        return Err(new PageTooLarge("Page number greater than total pages"));
    }

    let books;

    try {
        books = await Book.find(filter)
            .select("_id name image originalPrice currentPrice")
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (err) {
        return Err(err as Error);
    }

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return Ok({
        results: transformedBooks,
        currentPage: page,
        totalPages,
    });
};

export const getNewBooks = async (queryParams: QueryParams): Promise<Result<PaginatedResult<IBook>, Error>> => {
    const { page, limit, minPrice, maxPrice } = queryParams;
    const currentYear = new Date().getFullYear();

    const filter: FilterQuery<IBook> = { publicationYear: currentYear };

    // Add minPrice and maxPrice filters if they are provided
    if (minPrice !== undefined && maxPrice !== undefined) {
        filter.currentPrice = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice !== undefined) {
        filter.currentPrice = { $gte: minPrice };
    } else if (maxPrice !== undefined) {
        filter.currentPrice = { $lte: maxPrice };
    }

    let count;

    try {
        count = await Book.countDocuments(filter);
    } catch (error) {
        return Err(error as Error);
    }

    const totalPages = Math.ceil(count / limit);
    if (page > totalPages) {
        return Err(new PageTooLarge("Page number greater than total pages"));
    }

    let books;

    try {
        books = await Book.find(filter)
            .select("_id name image originalPrice currentPrice")
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (err) {
        return Err(err as Error);
    }

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return Ok({
        results: transformedBooks,
        currentPage: page,
        totalPages,
    });
};

export const getClassicBooks = async (queryParams: QueryParams): Promise<Result<PaginatedResult<IBook>, Error>> => {
    const { page, limit, minPrice, maxPrice } = queryParams;

    const filter: FilterQuery<IBook> = { genre: "Văn học kinh điển" };

    // Add minPrice and maxPrice filters if they are provided
    if (minPrice !== undefined && maxPrice !== undefined) {
        filter.currentPrice = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice !== undefined) {
        filter.currentPrice = { $gte: minPrice };
    } else if (maxPrice !== undefined) {
        filter.currentPrice = { $lte: maxPrice };
    }

    let count;

    try {
        count = await Book.countDocuments(filter);
    } catch (error) {
        return Err(error as Error);
    }

    const totalPages = Math.ceil(count / limit);
    if (page > totalPages) {
        return Err(new PageTooLarge("Page number greater than total pages"));
    }

    let books;

    try {
        books = await Book.find(filter)
            .select("_id name image originalPrice currentPrice")
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (err) {
        return Err(err as Error);
    }

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return Ok({
        results: transformedBooks,
        currentPage: page,
        totalPages,
    });
};

export const getDiscountBooks = async (queryParams: QueryParams): Promise<Result<PaginatedResult<IBook>, Error>> => {
    const { page, limit, minPrice, maxPrice } = queryParams;

    const filter: FilterQuery<IBook> = { $expr: { $gt: ["$originalPrice", "$currentPrice"] } };

    // Add minPrice and maxPrice filters if they are provided
    if (minPrice !== undefined && maxPrice !== undefined) {
        filter.currentPrice = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice !== undefined) {
        filter.currentPrice = { $gte: minPrice };
    } else if (maxPrice !== undefined) {
        filter.currentPrice = { $lte: maxPrice };
    }

    let count;

    try {
        count = await Book.countDocuments(filter);
    } catch (error) {
        return Err(error as Error);
    }

    const totalPages = Math.ceil(count / limit);
    if (page > totalPages) {
        return Err(new PageTooLarge("Page number greater than total pages"));
    }

    let discountBooks;

    try {
        discountBooks = await Book.aggregate([
            {
                $match: filter,
            },
            {
                $addFields: {
                    priceDifference: {
                        $divide: [{ $subtract: ["$originalPrice", "$currentPrice"] }, "$originalPrice"],
                    },
                },
            },
            {
                $sort: {
                    priceDifference: -1, // Sort in descending order
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    originalPrice: 1,
                    currentPrice: 1,
                },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ]);
    } catch (err) {
        return Err(err as Error);
    }

    const transformedBooks: IBook[] = discountBooks.map((book) => {
        book.id = book._id.toString();
        delete book._id;
        delete book.__v;

        // resize image
        book.image = book.image.replace("/image/upload/", `/image/upload/w_${ImageSize.Small}/`);

        return book;
    });

    return Ok({
        results: transformedBooks,
        currentPage: page,
        totalPages,
    });
};

export const getPopularBooks = async (queryParams: QueryParams): Promise<Result<PaginatedResult<IBook>, Error>> => {
    const { page, limit, minPrice, maxPrice } = queryParams;

    const filter: FilterQuery<IBook> = {};

    // Add minPrice and maxPrice filters if they are provided
    if (minPrice !== undefined && maxPrice !== undefined) {
        filter.currentPrice = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice !== undefined) {
        filter.currentPrice = { $gte: minPrice };
    } else if (maxPrice !== undefined) {
        filter.currentPrice = { $lte: maxPrice };
    }

    let count;

    try {
        count = await Book.countDocuments(filter);
    } catch (error) {
        return Err(error as Error);
    }

    const totalPages = Math.ceil(count / limit);
    if (page > totalPages) {
        return Err(new PageTooLarge("Page number greater than total pages"));
    }

    let books;

    try {
        books = await Book.find(filter)
            .select("_id name image originalPrice currentPrice")
            .sort({ discountPercent: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (err) {
        return Err(err as Error);
    }

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return Ok({
        results: transformedBooks,
        currentPage: page,
        totalPages,
    });
};

export const getRelatedBooks = async (id: string): Promise<Result<IBook[], Error>> => {
    try {
        const book = await Book.findById(id);

        if (!book) {
            return Err(new Error("Book not found"));
        }

        const sameCategoryPromise = Book.find({ genre: book.genre, _id: { $ne: book.id } }).limit(5);
        const sameAuthorPromise = Book.find({ author: book.author, _id: { $ne: book.id } }).limit(3);
        const sameYearPromise = Book.find({ publicationYear: book.publicationYear, _id: { $ne: book.id } }).limit(3);

        const [sameCategory, sameAuthor, sameYear] = await Promise.all([
            sameCategoryPromise,
            sameAuthorPromise,
            sameYearPromise,
        ]);

        const returnedBooks = sameCategory.concat(sameAuthor, sameYear).map((book) => book.toClient(ImageSize.Small));

        return Ok(returnedBooks);
    } catch (error) {
        return Err(error as Error);
    }
};

export const getBookById = async (id: string): Promise<Result<IBook, Error>> => {
    try {
        const book = await Book.findById(id);
        if (book === null) return Err(new BookNotFound(`Book with id ${id} not found`));
        return Ok(book.toClient(ImageSize.Medium));
    } catch (error) {
        return Err(error as Error);
    }
};

export const countBooksInCategories = async (): Promise<
    Result<
        { newBooksCount: number; classicBooksCount: number; discountBooksCount: number; popularBooksCount: number },
        Error
    >
> => {
    try {
        const newBooksPromise = Book.countDocuments({ publicationYear: new Date().getFullYear() });
        const classicBooksPromise = Book.countDocuments({ genre: "Văn học kinh điển" });
        const discountBooksPromise = Book.countDocuments({ $expr: { $gt: ["$originalPrice", "$currentPrice"] } });
        const popularBooksPromise = Book.countDocuments({});

        const [newBooksCount, classicBooksCount, discountBooksCount, popularBooksCount] = await Promise.all([
            newBooksPromise,
            classicBooksPromise,
            discountBooksPromise,
            popularBooksPromise,
        ]);

        return Ok({
            newBooksCount,
            classicBooksCount,
            discountBooksCount,
            popularBooksCount,
        });
    } catch (error) {
        return Err(error as Error);
    }
};
