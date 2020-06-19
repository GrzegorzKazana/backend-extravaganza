import type { RouteHandler } from '../types';
import type { BookRepository, Book, BookGenre } from './Book.models';

export interface BookController {
    getBook: RouteHandler<{ book: Book }, unknown, { bookId: string }>;
    getAllBooks: RouteHandler<{ books: Book[] }>;
    queryBooksByAuthor: RouteHandler<
        { books: Book[] },
        unknown,
        Record<string, string>,
        { authorId: string }
    >;
    queryBooksByGenre: RouteHandler<
        { books: Book[] },
        unknown,
        Record<string, string>,
        { genre: BookGenre }
    >;
    queryPaginatedBooks: RouteHandler<
        { books: Book[] },
        unknown,
        Record<string, string>,
        { from: number; count: number }
    >;
    postBook: RouteHandler<{ book: Book }, Book>;
}

export default function createBookController(bookRepository: BookRepository): BookController {
    return {
        getBook: ({ params: { bookId } }, res, next) =>
            bookRepository
                .getById(bookId)
                .then(book => res.json({ book }))
                .catch(next),

        getAllBooks: (req, res, next) =>
            bookRepository
                .getBooks()
                .then(books => res.json({ books }))
                .catch(next),

        queryBooksByAuthor: ({ query: { authorId } }, res, next) =>
            bookRepository
                .getBooksByAuthor(authorId)
                .then(books => res.json({ books }))
                .catch(next),

        queryBooksByGenre: ({ query: { genre } }, res, next) =>
            bookRepository
                .getBooksByGenre(genre)
                .then(books => res.json({ books }))
                .catch(next),

        queryPaginatedBooks: ({ query: { from, count } }, res, next) =>
            bookRepository
                .getBooks(from, count)
                .then(books => res.json({ books }))
                .catch(next),

        postBook: ({ body }, res, next) =>
            bookRepository
                .save(body)
                .then(book => res.json({ book }))
                .catch(next),
    };
}
