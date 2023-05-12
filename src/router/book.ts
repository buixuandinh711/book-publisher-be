import express, { Request, Response } from "express";
import { Book, IBook } from "../model/book";
import { DEFAULT_PAGE_LIMIT, ImageSize } from "../utils/const";
import { PaginatedResult, QueryParams } from "../utils/type";
const router = express.Router();

router.get("/", async (req: Request<{}, {}, {}, QueryParams>, res: Response<PaginatedResult<IBook>>) => {
  const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

  try {
    const books = await Book.find()
      .select("_id name image originalPrice discountPrice discountPercent")
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Book.countDocuments();

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return res.status(200).json({
      results: transformedBooks,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error: any) {
    return res.status(501).send(error.message);
  }
});

router.get("/new", async (req: Request<{}, {}, {}, QueryParams>, res: Response<PaginatedResult<IBook>>) => {
  const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

  try {
    const books = await Book.find()
      .sort({ publicationYear: -1 })
      .select("_id name image originalPrice discountPrice discountPercent")
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Book.countDocuments();

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return res.status(200).json({
      results: transformedBooks,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error: any) {
    return res.status(501).send(error.message);
  }
});

router.get("/classic", async (req: Request<{}, {}, {}, QueryParams>, res: Response<PaginatedResult<IBook>>) => {
  const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

  try {
    const books = await Book.find({
      category: "Văn học kinh điển",
    })
      .select("_id name image originalPrice discountPrice discountPercent")
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Book.countDocuments({
      category: "Văn học kinh điển",
    });

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return res.status(200).json({
      results: transformedBooks,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error: any) {
    return res.status(501).send(error.message);
  }
});

router.get("/discount", async (req: Request<{}, {}, {}, QueryParams>, res: Response<PaginatedResult<IBook>>) => {
  const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

  try {
    const books = await Book.find({ discountPercent: { $gte: 50 } })
      .select("_id name image originalPrice discountPrice discountPercent")
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Book.countDocuments({
      category: "Văn học kinh điển",
    });

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return res.status(200).json({
      results: transformedBooks,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error: any) {
    return res.status(501).send(error.message);
  }
});

router.get("/popular", async (req: Request<{}, {}, {}, QueryParams>, res: Response<PaginatedResult<IBook>>) => {
  const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

  try {
    const books = await Book.find()
      .select("_id name image originalPrice discountPrice discountPercent")
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Book.countDocuments({
      category: "Văn học kinh điển",
    });

    const transformedBooks: IBook[] = books.map((book) => book.toClient(ImageSize.Small));

    return res.status(200).json({
      results: transformedBooks,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
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
    const fields = "_id name image originalPrice discountPrice discountPercent";
    try {
      const newBooks = await Book.find().sort({ publicationYear: -1 }).select(fields).limit(DEFAULT_PAGE_LIMIT);

      const classicBooks = await Book.find({
        category: "Văn học kinh điển",
      })
        .select(fields)
        .limit(DEFAULT_PAGE_LIMIT);

      const discountBooks = await Book.find().sort({ discountPercent: -1 }).select(fields).limit(DEFAULT_PAGE_LIMIT);

      const popularBooks = await Book.find().select(fields).limit(DEFAULT_PAGE_LIMIT);

      res.status(200).json({
        newBooks: newBooks.map((book) => book.toClient(ImageSize.Small)),
        classicBooks: classicBooks.map((book) => book.toClient(ImageSize.Small)),
        discountBooks: discountBooks.map((book) => book.toClient(ImageSize.Small)),
        popularBooks: popularBooks.map((book) => book.toClient(ImageSize.Small)),
      });
    } catch (error: any) {
      return res.status(501).send(error.message);
    }
  }
);

router.get("/detail/:id", async (req: Request<{ id: string }, {}, {}, QueryParams>, res: Response<IBook>) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id);
    return res.status(200).json(book?.toClient(ImageSize.Medium));
  } catch (error: any) {
    return res.status(501).send(error.message);
  }
});

router.get(
  "/relate/:id",
  async (req: Request<{ id: string }, {}, {}, QueryParams>, res: Response<IBook[] | string>) => {
    try {
      const { id } = req.params;

      const book = await Book.findById(id);

      if (!book) {
        return res.status(501).send("Book not found");
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
      return res.status(200).json(returnedBooks);
    } catch (error: any) {
      return res.status(501).send(error.message);
    }
  }
);

export { router };
