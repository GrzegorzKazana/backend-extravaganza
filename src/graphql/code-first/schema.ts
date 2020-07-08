import type { Author, AuthorProps, Book, BookProps } from '../common/types';

import {
    GraphQLEnumType,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
} from 'graphql';
import { v4 as uuid } from 'uuid';

type BookStore = Record<string, Book>;
type AuthorStore = Record<string, Author>;
type Context = {
    books: BookStore;
    authors: AuthorStore;
};

const BookGenre = new GraphQLEnumType({
    name: 'BookGenre',
    values: {
        SCIFI: {},
        NOVEL: {},
        HORROR: {},
        FANTASY: {},
    },
});

const AuthorType: GraphQLObjectType<Book, Context> = new GraphQLObjectType<Book, Context>({
    name: 'Author',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        surname: { type: new GraphQLNonNull(GraphQLString) },
        dateOfBirth: { type: new GraphQLNonNull(GraphQLString) },
        books: {
            // AuthorType relies on BookType, thus fields are in a thunk
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(BookType))),
            resolve: ({ id }, _, { books }) =>
                Object.values(books).filter(book => book.author === id),
        },
    }),
});

const BookType: GraphQLObjectType<Book, Context> = new GraphQLObjectType<Book, Context>({
    name: 'Book',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: new GraphQLNonNull(BookGenre) },
        author: {
            type: new GraphQLNonNull(AuthorType),
            resolve: ({ author: id }, _, { authors }) => {
                const author = authors[id];
                if (!author) throw new Error('Author not found');

                return {
                    ...author,
                    dateOfBirth: author.dateOfBirth.toISOString(),
                };
            },
        },
    }),
});

const QueryType = new GraphQLObjectType<void, Context>({
    name: 'Query',
    fields: () => ({
        author: {
            type: AuthorType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve: (_, { id }, { authors }) => {
                const author = authors[id as string];
                if (!author) throw new Error('Author not found');

                return {
                    ...author,
                    dateOfBirth: author.dateOfBirth.toISOString(),
                };
            },
        },
        auhtors: {
            type: new GraphQLList(AuthorType),
            resolve: (_, __, { authors }) =>
                Object.values(authors).map(author => ({
                    ...author,
                    dateOfBirth: author.dateOfBirth.toISOString(),
                })),
        },
        authorsByYear: {
            type: new GraphQLList(AuthorType),
            args: { year: { type: GraphQLInt } },
            resolve: (_, { year: inputYear }, { authors }) => {
                const year = inputYear as number;
                const dateStart = new Date(year, 0, 1);
                const dateEnd = new Date(year + 1, 0, 1);

                return Object.values(authors)
                    .filter(({ dateOfBirth }) => dateOfBirth > dateStart && dateOfBirth < dateEnd)
                    .map(author => ({
                        ...author,
                        dateOfBirth: author.dateOfBirth.toISOString(),
                    }));
            },
        },
        book: {
            type: BookType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve: (_, { id: inputId }, { books }) => {
                const id = inputId as string;
                if (!books[id]) throw new Error('Book not found');

                return books[id];
            },
        },
        books: {
            type: new GraphQLList(BookType),
            resolve: (_, __, { books }) => Object.values(books),
        },
        booksByGenre: {
            type: new GraphQLList(BookType),
            args: { genre: { type: BookGenre } },
            resolve: (_, { genre }, { books }) =>
                Object.values(books).filter(book => book.genre === genre),
        },
    }),
});

const MutationType = new GraphQLObjectType<void, Context>({
    name: 'Mutation',
    fields: () => ({
        createBook: {
            type: BookType,
            args: {
                title: { type: new GraphQLNonNull(GraphQLString) },
                genre: { type: new GraphQLNonNull(BookGenre) },
                author: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: (_, inputBook, { books }) => {
                const book = inputBook as BookProps;
                const newBook = { ...book, id: uuid() };
                books[newBook.id] = newBook;

                return newBook;
            },
        },
        createAuthor: {
            type: AuthorType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                surname: { type: new GraphQLNonNull(GraphQLString) },
                dateOfBirth: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: (_, inputAuthor, { authors }) => {
                const author = inputAuthor as AuthorProps;
                const newAuthor = {
                    ...author,
                    dateOfBirth: new Date(author.dateOfBirth),
                    id: uuid(),
                };
                authors[newAuthor.id] = newAuthor;

                return {
                    ...newAuthor,
                    dateOfBirth: newAuthor.dateOfBirth.toISOString(),
                };
            },
        },
    }),
});
