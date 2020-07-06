import type { Author, AuthorProps, Book, BookProps } from '../common/types';

import { v4 as uuid } from 'uuid';

type BookStore = Record<string, Book>;
type AuthorStore = Record<string, Author>;
type Context = {
    books: BookStore;
    authors: AuthorStore;
};

type AuthorIsoDate = Omit<Author, 'dateOfBirth'> & { dateOfBirth: string };
type AuthorPropsIsoDate = Omit<AuthorProps, 'dateOfBirth'> & { dateOfBirth: string };

export default {
    Author: {
        books: ({ id }: Author, _: unknown, { books }: Context): Book[] =>
            Object.values(books).filter(book => book.author === id),
    },
    Book: {
        author: ({ author: id }: Book, _: unknown, { authors }: Context): AuthorIsoDate => {
            const author = authors[id];
            if (!author) throw new Error('Author not found');

            return {
                ...author,
                dateOfBirth: author.dateOfBirth.toISOString(),
            };
        },
    },
    Query: {
        author: (_: unknown, { id }: { id: string }, { authors }: Context): AuthorIsoDate => {
            const author = authors[id];
            if (!author) throw new Error('Author not found');

            return {
                ...author,
                dateOfBirth: author.dateOfBirth.toISOString(),
            };
        },
        authors: (_: unknown, __: unknown, { authors }: Context): AuthorIsoDate[] =>
            Object.values(authors).map(author => ({
                ...author,
                dateOfBirth: author.dateOfBirth.toISOString(),
            })),
        authorsByYear: (
            _: unknown,
            { year }: { year: number },
            { authors }: Context,
        ): AuthorIsoDate[] => {
            const dateStart = new Date(year, 0, 1);
            const dateEnd = new Date(year + 1, 0, 1);

            return Object.values(authors)
                .filter(({ dateOfBirth }) => dateOfBirth > dateStart && dateOfBirth < dateEnd)
                .map(author => ({
                    ...author,
                    dateOfBirth: author.dateOfBirth.toISOString(),
                }));
        },
        book: (_: unknown, { id }: { id: string }, { books }: Context): Book => {
            if (!books[id]) throw new Error('Book not found');
            return books[id];
        },
        books: (_: unknown, __: unknown, { books }: Context): Book[] => Object.values(books),
        booksByGenre: (_: unknown, { genre }: { genre: string }, { books }: Context): Book[] =>
            Object.values(books).filter(book => book.genre === genre),
    },
    Mutation: {
        createBook: (_: unknown, book: BookProps, { books }: Context): Book => {
            const newBook = { ...book, id: uuid() };
            books[newBook.id] = newBook;

            return newBook;
        },
        createAuthor: (
            _: unknown,
            author: AuthorPropsIsoDate,
            { authors }: Context,
        ): AuthorIsoDate => {
            const newAuthor = { ...author, dateOfBirth: new Date(author.dateOfBirth), id: uuid() };
            authors[newAuthor.id] = newAuthor;

            return {
                ...newAuthor,
                dateOfBirth: newAuthor.dateOfBirth.toISOString(),
            };
        },
    },
};
