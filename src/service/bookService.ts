import { FilterQuery, Expression } from "mongoose";
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
    const { page, limit, minPrice, maxPrice, genre, year, sortBy } = queryParams;

    const filter: FilterQuery<IBook> = {};

    if (genre !== undefined) {
        filter.genre = { $in: genre };
    }

    if (year !== undefined) {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 9;
        filter.$or = [{ publicationYear: { $in: year } }];
        if (year[year.length - 1] === lastYear) {
            filter.$or.push({ publicationYear: { $lt: lastYear } });
        }
    }

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
    if (totalPages > 0 && page > totalPages) {
        return Err(new PageTooLarge("Page number greater than total pages"));
    }

    let books;

    const sortFilter: { [key: string]: "asc" | "desc" } = {};
    if (sortBy !== undefined) {
        sortFilter[sortBy.field] = sortBy.order;
    }

    try {
        books = await Book.find(filter)
            .select("_id name image originalPrice currentPrice")
            .sort(sortFilter)
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
    const { page, limit, minPrice, maxPrice, genre, year, sortBy } = queryParams;
    const lastOneYear = new Date();
    lastOneYear.setFullYear(lastOneYear.getFullYear() - 1);

    const filter: FilterQuery<IBook> = { createdAt: { $gte: lastOneYear } };

    if (genre !== undefined) {
        filter.genre = { $in: genre };
    }

    if (year !== undefined) {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 9;
        filter.$or = [{ publicationYear: { $in: year } }];
        if (year[year.length - 1] === lastYear) {
            filter.$or.push({ publicationYear: { $lt: lastYear } });
        }
    }

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
    if (totalPages > 0 && page > totalPages) {
        return Err(new PageTooLarge("Page number greater than total pages"));
    }

    let books;

    const sortFilter: { [key: string]: "asc" | "desc" } = {};
    if (sortBy !== undefined) {
        sortFilter[sortBy.field] = sortBy.order;
    }

    try {
        books = await Book.find(filter)
            .select("_id name image originalPrice currentPrice")
            .sort(sortFilter)
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
    const { page, limit, minPrice, maxPrice, genre, year, sortBy } = queryParams;

    const filter: FilterQuery<IBook> = { genre: "Văn học kinh điển" };

    if (genre !== undefined) {
        filter.genre = { $in: genre };
    }

    if (year !== undefined) {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 9;
        filter.$or = [{ publicationYear: { $in: year } }];
        if (year[year.length - 1] === lastYear) {
            filter.$or.push({ publicationYear: { $lt: lastYear } });
        }
    }

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
    if (totalPages > 0 && page > totalPages) {
        return Err(new PageTooLarge("Page number greater than total pages"));
    }

    let books;
    const sortFilter: { [key: string]: "asc" | "desc" } = {};
    if (sortBy !== undefined) {
        sortFilter[sortBy.field] = sortBy.order;
    }

    try {
        books = await Book.find(filter)
            .select("_id name image originalPrice currentPrice")
            .sort(sortFilter)
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
    const { page, limit, minPrice, maxPrice, genre, year, sortBy } = queryParams;

    const filter: FilterQuery<IBook> = { $and: [{ $expr: { $lt: ["$currentPrice", "$originalPrice"] } }] };

    if (genre !== undefined) {
        filter.genre = { $in: genre };
    }

    if (year !== undefined) {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 9;
        const yearFilter: FilterQuery<IBook>[] = [{ publicationYear: { $in: year } }];
        if (year[year.length - 1] === lastYear) {
            yearFilter.push({ publicationYear: { $lt: lastYear } });
        }
        filter.$and?.push({ $or: yearFilter });
    }

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
    if (totalPages > 0 && page > totalPages) {
        return Err(new PageTooLarge("Page number greater than total pages"));
    }

    let discountBooks;

    const discountAggregate: any[] = [
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
    ];

    if (sortBy !== undefined) {
        const sortFilter: Record<string, 1 | -1 | Expression.Meta> = {};
        sortFilter[sortBy.field] = sortBy.order === "asc" ? 1 : -1;
        discountAggregate.splice(1, 0, { $sort: sortFilter });
    }

    try {
        discountBooks = await Book.aggregate(discountAggregate);
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
    const { page, limit, minPrice, maxPrice, genre, year, sortBy } = queryParams;

    const filter: FilterQuery<IBook> = {};

    if (genre !== undefined) {
        filter.genre = { $in: genre };
    }

    if (year !== undefined) {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 9;
        filter.$or = [{ publicationYear: { $in: year } }];
        if (year[year.length - 1] === lastYear) {
            filter.$or.push({ publicationYear: { $lt: lastYear } });
        }
    }

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
    if (totalPages > 0 && page > totalPages) {
        return Err(new PageTooLarge("Page number greater than total pages"));
    }

    let books;

    const sortFilter: { [key: string]: "asc" | "desc" } = {};
    if (sortBy !== undefined) {
        sortFilter[sortBy.field] = sortBy.order;
    }

    try {
        books = await Book.find(filter)
            .select("_id name image originalPrice currentPrice")
            .sort(sortFilter)
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

export const getBookGenres = async (): Promise<Result<string[], Error>> => {
    try {
        const result = await Book.aggregate([
            {
                $group: {
                    _id: null,
                    genres: { $addToSet: "$genre" },
                },
            },
        ]);

        const allGenres = result[0].genres as string[];
        const sortedGenres = allGenres.sort();
        return Ok(sortedGenres);
    } catch (error) {
        return Err(error as Error);
    }
};
