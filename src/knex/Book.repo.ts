import type Knex from 'knex';
import type {
    BookRepository as IBookRepository,
    Book,
    BookProps,
    BookGenre,
} from '../common/book/Book.models';

import { ServerError } from '../common/errors';
import { isNumber } from '../common/utils';

export default class BookRepository implements IBookRepository {
    private Books = () => this.knex<Book>('Books');

    constructor(private knex: Knex) {}

    public async init(): Promise<BookRepository> {
        await this.knex.schema.createTable('Books', table => {
            table.uuid('id').notNullable();
            table.text('title').notNullable();
            table.text('gener').notNullable();
            table.foreign('Authors').references('id').inTable('Authors');
        });

        return this;
    }

    public async getById(bookId: string): Promise<Book> {
        const book = await this.Books().select().where('id', bookId).first();

        if (!book) throw new ServerError('Book not found', 404);

        return book;
    }

    public async exists(bookId: string): Promise<boolean> {
        const book = await this.getById(bookId);

        return !!book;
    }

    public async save(book: BookProps): Promise<Book> {
        const newBook = await this.Books().insert(book).returning('*').first();

        // assuming that insertion succeds -> row is returned
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return newBook!;
    }

    public async delete(bookId: string): Promise<Book> {
        const book = await this.Books().where('id', bookId).delete().returning('*').first();

        if (!book) throw new ServerError('Book not found', 404);

        return book;
    }

    public async update(bookId: string, newBookData: Partial<BookProps>): Promise<Book> {
        const newBook = await this.Books()
            .update(newBookData)
            .where('id', bookId)
            .returning('*')
            .first();

        if (!newBook) throw new ServerError('Book not found', 404);

        return newBook;
    }

    public getBooksByAuthor(authorId: string): Promise<Book[]> {
        return this.Books().select().where('author', authorId);
    }

    public async getBooks(from?: number, count?: number): Promise<Book[]> {
        const isPaginationInvalid = count && count < 1;

        return isNumber(from) && isNumber(count)
            ? !isPaginationInvalid
                ? this.Books().select().limit(count).offset(from)
                : []
            : this.Books().select();
    }

    public getBooksByGenre(genre: BookGenre): Promise<Book[]> {
        return this.Books().select().where('genre', genre);
    }
}
