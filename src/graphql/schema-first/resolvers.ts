import type { Author, AuthorProps, Book, BookProps } from '../common/types';

import { v4 as uuid } from 'uuid';

const mockBooks: Record<string, Book> = {};
const mockAuthors: Record<string, Author> = {};

export default {
    Author: {
        books: ({ id }: Author): Book[] =>
            Object.values(mockBooks).filter(book => book.author === id),
    },
    Book: {
        author: ({ author }: Book): Author => {
            if (!mockAuthors[author]) throw new Error('Author not found');
            return mockAuthors[author];
        },
    },
    Query: {
        author: (_: unknown, { id }: { id: string }): Author => {
            if (!mockAuthors[id]) throw new Error('Author not found');
            return mockAuthors[id];
        },
        authors: (): Author[] => Object.values(mockAuthors),
        book: (_: unknown, { id }: { id: string }): Book => {
            if (!mockBooks[id]) throw new Error('Book not found');
            return mockBooks[id];
        },
        books: (): Book[] => Object.values(mockBooks),
    },
    Mutation: {
        createBook: (_: unknown, book: BookProps): Book => {
            const newBook = { ...book, id: uuid() };
            mockBooks[newBook.id] = newBook;

            return newBook;
        },
        createAuthor: (
            _: unknown,
            author: Omit<AuthorProps, 'dateOfBirth'> & { dateOfBirth: string },
        ): Author => {
            const newAuthor = { ...author, dateOfBirth: new Date(author.dateOfBirth), id: uuid() };
            mockAuthors[newAuthor.id] = newAuthor;

            return newAuthor;
        },
    },
};
