import express, { Request, Response } from "express";
import { Book, IBook } from "../model/book";
import { DEFAULT_PAGE_LIMIT, ImageSize } from "../utils/const";
import { PaginatedResult, QueryParams } from "../utils/type";
const router = express.Router();

router.get(
  "/newest",
  async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response<PaginatedResult<IBook>>
  ) => {
    const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

    try {
      const books = await Book.find()
        .sort({ publicationYear: -1 })
        .select("_id name image originalPrice discountPrice discountPercent")
        .skip((page - 1) * limit)
        .limit(limit);

      const count = await Book.countDocuments();

      const transformedBooks: IBook[] = books.map((book) =>
        book.toClient(ImageSize.Small)
      );

      return res.status(200).json({
        results: transformedBooks,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error: any) {
      return res.status(501).send(error.message);
    }
  }
);

router.get(
  "/classic",
  async (
    req: Request<{}, {}, {}, QueryParams>,
    res: Response<PaginatedResult<IBook>>
  ) => {
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

      const transformedBooks: IBook[] = books.map((book) =>
        book.toClient(ImageSize.Small)
      );

      return res.status(200).json({
        results: transformedBooks,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error: any) {
      return res.status(501).send(error.message);
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
    const fields = "_id name image originalPrice discountPrice discountPercent";
    try {
      const newBooks = await Book.find()
        .sort({ publicationYear: -1 })
        .select(fields)
        .limit(DEFAULT_PAGE_LIMIT);

      const classicBooks = await Book.find({
        category: "Văn học kinh điển",
      })
        .select(fields)
        .limit(DEFAULT_PAGE_LIMIT);

      const discountBooks = await Book.find()
        .sort({ discountPercent: -1 })
        .select(fields)
        .limit(DEFAULT_PAGE_LIMIT);

      const popularBooks = await Book.find()
        .select(fields)
        .limit(DEFAULT_PAGE_LIMIT);

      res.status(200).json({
        newBooks: newBooks.map((book) => book.toClient(ImageSize.Small)),
        classicBooks: classicBooks.map((book) =>
          book.toClient(ImageSize.Small)
        ),
        discountBooks: discountBooks.map((book) =>
          book.toClient(ImageSize.Small)
        ),
        popularBooks: popularBooks.map((book) =>
          book.toClient(ImageSize.Small)
        ),
      });
    } catch (error: any) {
      return res.status(501).send(error.message);
    }
  }
);

router.get(
  "/detail/:id",
  async (
    req: Request<{ id: string }, {}, {}, QueryParams>,
    res: Response<IBook>
  ) => {
    const { id } = req.params;

    try {
      const book = await Book.findById(id);
      return res.status(200).json(book?.toClient(ImageSize.Medium));
    } catch (error: any) {
      return res.status(501).send(error.message);
    }
  }
);

export { router };
