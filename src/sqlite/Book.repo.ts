import type { Database } from 'sqlite';
import type {
    BookRepository as IBookRepository,
    Book,
    BookProps,
    BookGenre,
} from '../common/book/Book.models';

import { v4 as uuid } from 'uuid';
import SQL from 'sql-template-strings';

import { ServerError } from '../common/errors';
import { isNil } from '../common/utils';

export default class BookRepository implements IBookRepository {
    constructor(private db: Database) {}

    public async init(): Promise<BookRepository> {
        await this.db.exec(SQL`CREATE TABLE Books (
            id TEXT NOT NULL PRIMARY KEY,
            title TEXT NOT NULL,
            genre TEXT NOT NULL,
            author TEXT NOT NULL,
            FOREIGN KEY (author) REFERENCES Authors (id)
        )`);

        return this;
    }

    public async getById(bookId: string): Promise<Book> {
        const book = await this.db.get<Book>(SQL`SELECT * FROM Books WHERE id = ${bookId}`);

        if (!book) throw new ServerError('Book not found', 404);

        return book;
    }

    public async exists(bookId: string): Promise<boolean> {
        const book = await this.db.get<Book>(SQL`SELECT * FROM Books WHERE id = ${bookId}`);

        return !!book;
    }

    public async save(book: BookProps): Promise<Book> {
        const newBook = { ...book, id: uuid() };

        await this.db.run(SQL`INSERT INTO Books (id, title, genre, author) VALUES (
            ${newBook.id},
            ${newBook.title},
            ${newBook.genre},
            ${newBook.author}
        )`);

        return newBook;
    }

    public async delete(bookId: string): Promise<Book> {
        const book = await this.getById(bookId);

        if (!book) throw new ServerError('Book not found', 404);

        await this.db.run(SQL`DELETE FROM Books WHERE id = ${bookId}`);

        return book;
    }

    public async update(bookId: string, newBookData: Partial<BookProps>): Promise<Book> {
        const book = await this.getById(bookId);

        if (!book) throw new ServerError('Book not found', 404);

        const newBook = { ...book, ...newBookData, id: book.id };

        await this.db.run(SQL`UPDATE Books
            SET title = ${newBook.title},
                genre = ${newBook.genre},
                author = ${newBook.author}
            WHERE id = ${bookId}
        `);

        return newBook;
    }

    public getBooksByAuthor(authorId: string): Promise<Book[]> {
        return this.db.all<Book[]>(SQL`SELECT * FROM Books WHERE author = ${authorId}`);
    }

    public async getBooks(from?: number, count?: number): Promise<Book[]> {
        const isUsingPagination = !isNil(from) && !isNil(count);
        const isPaginationInvalid = count && count < 1;

        return !isUsingPagination
            ? this.db.all<Book[]>(SQL`SELECT * FROM Books`)
            : isPaginationInvalid
            ? []
            : this.db.all<Book[]>(SQL`SELECT * FROM Books LIMIT ${count} OFFSET ${from}`);
    }

    public getBooksByGenre(genre: BookGenre): Promise<Book[]> {
        return this.db.all<Book[]>(
            SQL`SELECT * FROM Books WHERE LOWER(genre) = ${genre.toLowerCase()}`,
        );
    }
}
