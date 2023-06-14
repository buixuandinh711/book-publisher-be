import { Book, IBook } from "../model/bookModel";
import { ImageSize } from "../utils/const";
import { PaginatedResult } from "../utils/type";

export class PageTooLarge extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PageTooLarge";
    }
}

export const getAllBooks = async (page: number, limit: number): Promise<PaginatedResult<IBook>> => {
    const count = await Book.countDocuments();
    const totalPages = Math.ceil(count / limit);
    if (page > totalPages) {
        throw new PageTooLarge("Page number greater than total pages");
    }

    const books = await Book.find()
        .select("_id name image originalPrice currentPrice")
        .skip((page - 1) * limit)
        .limit(limit);

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return {
        results: transformedBooks,
        currentPage: page,
        totalPages,
    };
};

export const getNewBooks = async (page: number, limit: number): Promise<PaginatedResult<IBook>> => {
    const currentYear = new Date().getFullYear();

    const count = await Book.countDocuments({ publicationYear: currentYear });
    const totalPages = Math.ceil(count / limit);
    if (page > totalPages) {
        throw new PageTooLarge("Page number greater than total pages");
    }

    const books = await Book.find({ publicationYear: currentYear })
        .select("_id name image originalPrice currentPrice")
        .skip((page - 1) * limit)
        .limit(limit);

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return {
        results: transformedBooks,
        currentPage: page,
        totalPages,
    };
};

export const getClassicBooks = async (page: number, limit: number): Promise<PaginatedResult<IBook>> => {
    const count = await Book.countDocuments({ category: "Văn học kinh điển" });
    const totalPages = Math.ceil(count / limit);
    if (page > totalPages) {
        throw new PageTooLarge("Page number greater than total pages");
    }

    const books = await Book.find({ category: "Văn học kinh điển" })
        .select("_id name image originalPrice currentPrice")
        .skip((page - 1) * limit)
        .limit(limit);

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return {
        results: transformedBooks,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

export const getDiscountBooks = async (page: number, limit: number): Promise<PaginatedResult<IBook>> => {
    const count = await Book.countDocuments({ $expr: { $gt: ["$originalPrice", "$currentPrice"] } });
    const totalPages = Math.ceil(count / limit);
    if (page > totalPages) {
        throw new PageTooLarge("Page number greater than total pages");
    }

    const discountBooks = await Book.aggregate([
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

    const transformedBooks: IBook[] = discountBooks.map((book) => {
        book.id = book._id.toString();
        delete book._id;
        delete book.__v;

        // resize image
        book.image = book.image.replace("/image/upload/", `/image/upload/w_${ImageSize.Small}/`);

        return book;
    });
    return {
        results: transformedBooks,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

export const getPopularBooks = async (page: number, limit: number): Promise<PaginatedResult<IBook>> => {
    const count = await Book.countDocuments({});
    const totalPages = Math.ceil(count / limit);
    if (page > totalPages) {
        throw new PageTooLarge("Page number greater than total pages");
    }

    const books = await Book.find({})
        .select("_id name image originalPrice currentPrice")
        .sort({ discountPercent: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return {
        results: transformedBooks,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

export const getRelatedBooks = async (id: string): Promise<IBook[]> => {
    const book = await Book.findById(id);

    if (!book) {
        throw new Error("Book not found");
    }

    const sameCategoryPromise = Book.find({ category: book.category, _id: { $ne: book.id } }).limit(5);
    const sameAuthorPromise = Book.find({ author: book.author, _id: { $ne: book.id } }).limit(3);
    const sameYearPromise = Book.find({ publicationYear: book.publicationYear, _id: { $ne: book.id } }).limit(3);

    const [sameCategory, sameAuthor, sameYear] = await Promise.all([
        sameCategoryPromise,
        sameAuthorPromise,
        sameYearPromise,
    ]);

    const returnedBooks = sameCategory.concat(sameAuthor, sameYear).map((book) => book.toClient(ImageSize.Small));

    return returnedBooks;
};

export const getBookById = async (id: string): Promise<IBook | null> => {
    const book = await Book.findById(id);
    if (book === null) return null;
    return book.toClient(ImageSize.Medium);
};

export const countBooksInCategories = async () => {
    const newBooksPromise = Book.countDocuments({ publicationYear: new Date().getFullYear() });
    const classicBooksPromise = Book.countDocuments({ category: "Văn học kinh điển" });
    const discountBooksPromise = Book.countDocuments({ $expr: { $gt: ["$originalPrice", "$currentPrice"] } });
    const popularBooksPromise = Book.countDocuments({});

    const [newBooksCount, classicBooksCount, discountBooksCount, popularBooksCount] = await Promise.all([
        newBooksPromise,
        classicBooksPromise,
        discountBooksPromise,
        popularBooksPromise,
    ]);

    return {
        newBooksCount,
        classicBooksCount,
        discountBooksCount,
        popularBooksCount,
    };
};
