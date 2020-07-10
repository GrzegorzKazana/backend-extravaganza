import type {
    AuthorResolvers,
    BookResolvers,
    QueryResolvers,
    MutationResolvers,
} from './generated/types';
import type { AuthorModel } from './models/Author.model';
import type { BookModel } from './models/Book.model';

type Context = {
    Authors: AuthorModel;
    Books: BookModel;
};

const authorResolver: AuthorResolvers<Context> = {
    dateOfBirth: ({ dateOfBirth }) => dateOfBirth.toISOString(),

    books: ({ id }, _, { Books }) => Books.find({ author: id }).exec(),
};

const bookResolver: BookResolvers<Context> = {
    author: async ({ author: id }, _, { Authors }) => {
        const author = await Authors.load(id);
        if (!author) throw new Error('Author not found');

        return author;
    },
};

const queryResolver: QueryResolvers<Context> = {
    author: async (_, { id }, { Authors }) => {
        const author = await Authors.load(id);
        if (!author) throw new Error('Author not found');

        return author;
    },

    authors: (_, __, { Authors }) => Authors.find({}).exec(),

    authorsByYear: (_, { year }, { Authors }) => {
        const dateStart = new Date(year, 0, 1);
        const dateEnd = new Date(year + 1, 0, 1);

        return Authors.find({ dateOfBirth: { $gte: dateStart, $lt: dateEnd } }).exec();
    },

    book: async (_, { id }, { Books }) => {
        const book = await Books.load(id);
        if (!book) throw new Error('Book not found');

        return book;
    },

    books: (_, __, { Books }) => Books.find({}).exec(),

    booksByGenre: (_, { genre }, { Books }) => Books.find({ genre }).exec(),
};

const mutationResolver: MutationResolvers<Context> = {
    createBook: (_, book, { Books }) => new Books(book).save(),

    createAuthor: (_, author, { Authors }) =>
        new Authors({ ...author, dateOfBirth: new Date(author.dateOfBirth) }).save(),
};

export default {
    Author: authorResolver,
    Book: bookResolver,
    Query: queryResolver,
    Mutation: mutationResolver,
};
