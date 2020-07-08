import type { Author as AuthorDb, Book as BookDb } from '../common/types';
import type {
    AuthorResolvers,
    BookResolvers,
    QueryResolvers,
    MutationResolvers,
} from './generated/types';

import { v4 as uuid } from 'uuid';

type BookStore = Record<string, BookDb>;
type AuthorStore = Record<string, AuthorDb>;
type Context = {
    books: BookStore;
    authors: AuthorStore;
};

const authorResolver: AuthorResolvers<Context> = {
    books: ({ id }, _, { books }) => Object.values(books).filter(book => book.author === id),
};

const bookResolver: BookResolvers<Context> = {
    author: ({ author: id }, _, { authors }) => {
        const author = authors[id];
        if (!author) throw new Error('Author not found');

        return {
            ...author,
            dateOfBirth: author.dateOfBirth.toISOString(),
        };
    },
};

const queryResolver: QueryResolvers<Context> = {
    author: (_, { id }, { authors }) => {
        const author = authors[id];
        if (!author) throw new Error('Author not found');

        return {
            ...author,
            dateOfBirth: author.dateOfBirth.toISOString(),
        };
    },

    authors: (_, __, { authors }) =>
        Object.values(authors).map(author => ({
            ...author,
            dateOfBirth: author.dateOfBirth.toISOString(),
        })),

    authorsByYear: (_, { year }, { authors }) => {
        const dateStart = new Date(year, 0, 1);
        const dateEnd = new Date(year + 1, 0, 1);

        return Object.values(authors)
            .filter(({ dateOfBirth }) => dateOfBirth > dateStart && dateOfBirth < dateEnd)
            .map(author => ({
                ...author,
                dateOfBirth: author.dateOfBirth.toISOString(),
            }));
    },

    book: (_, { id }, { books }) => {
        if (!books[id]) throw new Error('Book not found');
        return books[id];
    },

    books: (_, __, { books }) => Object.values(books),

    booksByGenre: (_, { genre }, { books }) =>
        Object.values(books).filter(book => book.genre === genre),
};

const mutationResolver: MutationResolvers<Context> = {
    createBook: (_, book, { books }) => {
        const newBook = { ...book, id: uuid() };
        books[newBook.id] = newBook;

        return newBook;
    },

    createAuthor: (_, author, { authors }) => {
        const newAuthor = { ...author, dateOfBirth: new Date(author.dateOfBirth), id: uuid() };
        authors[newAuthor.id] = newAuthor;

        return {
            ...newAuthor,
            dateOfBirth: newAuthor.dateOfBirth.toISOString(),
        };
    },
};

export default {
    Author: authorResolver,
    Book: bookResolver,
    Query: queryResolver,
    Mutation: mutationResolver,
};
