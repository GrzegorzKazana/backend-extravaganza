import type {
    BookRepository as IBookRepository,
    Book,
    BookProps,
    BookGenre,
} from '../common/book/Book.models';

import { v4 as uuid } from 'uuid';

import { ServerError } from '@/common/errors';
import { isPaginationValid } from '@/common/utils';

export default class BookRepository implements IBookRepository {
    private books: Map<string, Book> = new Map<string, Book>();

    public getById(bookId: string): Promise<Book> {
        const book = this.books.get(bookId);

        return book
            ? Promise.resolve(book)
            : Promise.reject(new ServerError('Book not found', 404));
    }

    public exists(bookId: string): Promise<boolean> {
        return Promise.resolve(!!this.books.get(bookId));
    }

    public save(book: BookProps): Promise<Book> {
        const newBook = { ...book, id: uuid() };

        this.books.set(newBook.id, newBook);

        return Promise.resolve(newBook);
    }

    public delete(bookId: string): Promise<Book> {
        const book = this.books.get(bookId);

        if (!book) return Promise.reject(new ServerError('Book not found', 404));

        this.books.delete(bookId);

        return Promise.resolve(book);
    }

    public update(bookId: string, newBookData: Partial<BookProps>): Promise<Book> {
        const book = this.books.get(bookId);

        if (!book) return Promise.reject(new ServerError('Book not found', 404));

        const newBook = { ...book, ...newBookData, id: book.id };

        this.books.set(book.id, newBook);

        return Promise.resolve(newBook);
    }

    public getBooksByAuthor(authorId: string): Promise<Book[]> {
        const books = [...this.books.values()];
        const booksByAuthor = books.filter(({ author }) => author === authorId);

        return Promise.resolve(booksByAuthor);
    }

    public getBooks(from?: number, count?: number): Promise<Book[]> {
        const books = [...this.books.values()];
        const startIdx = from ?? 0;
        const endIdx = startIdx + (count ?? books.length);

        return isPaginationValid(startIdx, endIdx)
            ? Promise.resolve(books.slice(startIdx, endIdx))
            : Promise.resolve([]);
    }

    public getBooksByGenre(genre: BookGenre): Promise<Book[]> {
        const books = [...this.books.values()];
        const booksInGenre = books.filter(book => book.genre.toLowerCase() === genre.toLowerCase());

        return Promise.resolve(booksInGenre);
    }
}
