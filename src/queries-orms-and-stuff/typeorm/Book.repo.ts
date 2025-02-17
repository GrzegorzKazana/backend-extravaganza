import type { Connection } from 'typeorm';
import type {
    BookRepository as IBookRepository,
    Book,
    BookProps,
    BookGenre,
} from '../common/book/Book.models';

import { v4 as uuid } from 'uuid';

import { ServerError } from '@/common/errors';
import { isNil } from '@/common/utils';

import BookModel from './models/Book.model';

export default class BookRepository implements IBookRepository {
    private Books = this.connection.getRepository(BookModel);

    constructor(private connection: Connection) {}

    public async getById(bookId: string): Promise<Book> {
        const book = await this.Books.findOne(bookId);

        if (!book) throw new ServerError('Book not found', 404);

        return book;
    }

    public async exists(bookId: string): Promise<boolean> {
        const book = await this.Books.findOne(bookId);

        return !!book;
    }

    public async save(book: BookProps): Promise<Book> {
        const newBook = BookModel.fromDTO({ ...book, id: uuid() });

        await this.Books.insert(newBook);

        return newBook;
    }

    public delete(bookId: string): Promise<Book> {
        return this.Books.delete(bookId).then(() => this.getById(bookId));
    }

    public update(bookId: string, newBookData: Partial<BookProps>): Promise<Book> {
        return this.Books.update(bookId, newBookData).then(() => this.getById(bookId));
    }

    public getBooksByAuthor(authorId: string): Promise<Book[]> {
        return this.Books.find({ author: authorId });
    }

    public getBooks(from?: number, count?: number): Promise<Book[]> {
        if (isNil(from) || isNil(count)) return this.Books.find();

        const isPaginationInvalid = count < 1;

        return !isPaginationInvalid
            ? this.Books.createQueryBuilder().skip(from).take(count).getMany()
            : Promise.resolve([]);
    }

    public getBooksByGenre(genre: BookGenre): Promise<Book[]> {
        return this.Books.createQueryBuilder()
            .where('LOWER("genre") = :genre')
            .setParameters({ genre })
            .getMany();
    }
}
