import type Knex from 'knex';
import type {
    BookRepository as IBookRepository,
    Book,
    BookProps,
    BookGenre,
} from '../common/book/Book.models';

import { v4 as uuid } from 'uuid';

import { ServerError } from '@/common/errors';
import { isNil } from '@/common/utils';

export default class BookRepository implements IBookRepository {
    private Books = () => this.knex<Book>('Books');

    constructor(private knex: Knex) {}

    public async init(): Promise<BookRepository> {
        await this.knex.schema.createTable('Books', table => {
            table.uuid('id').primary().notNullable();
            table.text('title').notNullable();
            table.text('genre').notNullable();
            table.text('author').notNullable();
            table.foreign('author').references('id').inTable('Authors');
        });

        return this;
    }

    public async getById(bookId: string): Promise<Book> {
        const book = await this.Books().select().where('id', bookId).first();

        if (!book) throw new ServerError('Book not found', 404);

        return book;
    }

    public async exists(bookId: string): Promise<boolean> {
        const book = await this.Books().select().where('id', bookId).first();

        return !!book;
    }

    public save(book: BookProps): Promise<Book> {
        const bookData = { ...book, id: uuid() };

        return this.Books()
            .insert(bookData)
            .then(() => this.getById(bookData.id));
    }

    public delete(bookId: string): Promise<Book> {
        return this.Books()
            .where('id', bookId)
            .delete()
            .then(() => this.getById(bookId));
    }

    public update(bookId: string, newBookData: Partial<BookProps>): Promise<Book> {
        return this.Books()
            .update(newBookData)
            .where('id', bookId)
            .then(() => this.getById(bookId));
    }

    public getBooksByAuthor(authorId: string): Promise<Book[]> {
        return this.Books().select().where('author', authorId);
    }

    public getBooks(from?: number, count?: number): Promise<Book[]> {
        if (isNil(from) || isNil(count)) return this.Books().select();

        const isPaginationInvalid = count < 1;

        return !isPaginationInvalid
            ? this.Books().select().limit(count).offset(from)
            : Promise.resolve([]);
    }

    public getBooksByGenre(genre: BookGenre): Promise<Book[]> {
        return this.Books().select().where(this.knex.raw('LOWER("genre") = ?', genre));
    }
}
