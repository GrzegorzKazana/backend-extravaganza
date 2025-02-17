import type {
    BookRepository as IBookRepository,
    Book,
    BookProps,
    BookGenre,
} from '../common/book/Book.models';

import { ServerError } from '@/common/errors';
import { isNil } from '@/common/utils';

import { BookModel, BooksType } from './models/Book.model';

export default class BookRepository implements IBookRepository {
    constructor(private Books: BookModel) {}

    public async getById(bookId: string): Promise<Book> {
        const book = await this.Books.findById(bookId);

        if (!book) throw new ServerError('Book not found', 404);

        return book.toDTO();
    }

    public async exists(bookId: string): Promise<boolean> {
        const book = await this.Books.findById(bookId);

        return !!book;
    }

    public async save(book: BookProps): Promise<Book> {
        const newBook = await new this.Books(book).save();

        return newBook.toDTO();
    }

    public async delete(bookId: string): Promise<Book> {
        const deletedBook = await this.Books.findByIdAndDelete(bookId);

        if (!deletedBook) throw new ServerError('Book not found', 404);

        return deletedBook.toDTO();
    }

    public async update(bookId: string, newBookData: Partial<BookProps>): Promise<Book> {
        const updatedBook = await this.Books.findByIdAndUpdate(bookId, newBookData, {
            new: true,
        });

        if (!updatedBook) throw new ServerError('Book not found', 404);

        return updatedBook.toDTO();
    }

    public async getBooksByAuthor(authorId: string): Promise<Book[]> {
        const books = await this.Books.find({ author: authorId });

        return books.map(book => book.toDTO());
    }

    public getBooks(from?: number, count?: number): Promise<Book[]> {
        if (isNil(from) || isNil(count)) return this.Books.find().then(BookRepository.formatBooks);

        const isPaginationInvalid = count < 1;

        return !isPaginationInvalid
            ? this.Books.find({}, null, { skip: from, limit: count }).then(
                  BookRepository.formatBooks,
              )
            : Promise.resolve([]);
    }

    public async getBooksByGenre(genre: BookGenre): Promise<Book[]> {
        const books = await this.Books.find({ genre: { $regex: genre, $options: 'i' } });

        return books.map(book => book.toDTO());
    }

    private static formatBooks(books: BooksType[]): Book[] {
        return books.map(book => book.toDTO());
    }
}
