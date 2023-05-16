import { Book, IBook } from "../model/bookModel";
import { DEFAULT_PAGE_LIMIT, ImageSize } from "../utils/const";
import { PaginatedResult, QueryParams } from "../utils/type";

export const getAllBooks = async (
    { page, limit }: QueryParams = { page: 1, limit: DEFAULT_PAGE_LIMIT }
): Promise<PaginatedResult<IBook>> => {
    const books = await Book.find()
        .select("_id name image originalPrice discountPrice discountPercent")
        .skip((page - 1) * limit)
        .limit(limit);

    const count = await Book.countDocuments();

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return {
        results: transformedBooks,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

export const getNewBooks = async (
    { page, limit }: QueryParams = { page: 1, limit: DEFAULT_PAGE_LIMIT }
): Promise<PaginatedResult<IBook>> => {
    const currentYear = new Date().getFullYear();

    const books = await Book.find({ publicationYear: currentYear })
        .select("_id name image originalPrice discountPrice discountPercent")
        .skip((page - 1) * limit)
        .limit(limit);

    const count = await Book.countDocuments({ publicationYear: currentYear });

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return {
        results: transformedBooks,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

export const getClassicBooks = async (
    { page, limit }: QueryParams = { page: 1, limit: DEFAULT_PAGE_LIMIT }
): Promise<PaginatedResult<IBook>> => {
    const books = await Book.find({ category: "Văn học kinh điển" })
        .select("_id name image originalPrice discountPrice discountPercent")
        .skip((page - 1) * limit)
        .limit(limit);

    const count = await Book.countDocuments({ category: "Văn học kinh điển" });

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return {
        results: transformedBooks,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

export const getDiscountBooks = async (
    { page, limit }: QueryParams = { page: 1, limit: DEFAULT_PAGE_LIMIT }
): Promise<PaginatedResult<IBook>> => {
    const books = await Book.find({ discountPercent: { $gt: 0 } })
        .select("_id name image originalPrice discountPrice discountPercent")
        .sort({ discountPercent: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const count = await Book.countDocuments({ discountPercent: { $gt: 0 } });

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return {
        results: transformedBooks,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

export const getPopularBooks = async (
    { page, limit }: QueryParams = { page: 1, limit: DEFAULT_PAGE_LIMIT }
): Promise<PaginatedResult<IBook>> => {
    const books = await Book.find({})
        .select("_id name image originalPrice discountPrice discountPercent")
        .sort({ discountPercent: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const count = await Book.countDocuments({});

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
