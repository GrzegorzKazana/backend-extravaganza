import { Resolver, Query, Mutation, Ctx, Arg, ID, Int } from 'type-graphql';

import { Context, Author, Book } from './types';
import { AuthorType } from './models/Author.model';
import { BookType } from './models/Book.model';
import { BookGenresEnum } from '../common/types';

@Resolver(Author)
export class AuthorResolver {
    @Query(() => Author, { nullable: true })
    async author(
        @Arg('id', () => ID) id: string,
        @Ctx() { Authors }: Context,
    ): Promise<AuthorType> {
        const author = await Authors.load(id);
        if (!author) throw new Error('Author not found');

        return author;
    }

    @Query(() => [Author])
    authors(@Ctx() { Authors }: Context): Promise<AuthorType[]> {
        return Authors.find({}).exec();
    }

    @Query(() => [Author])
    authorsByYear(
        @Arg('year', () => Int) year: number,
        @Ctx() { Authors }: Context,
    ): Promise<AuthorType[]> {
        const dateStart = new Date(year, 0, 1);
        const dateEnd = new Date(year + 1, 0, 1);

        return Authors.find({ dateOfBirth: { $gte: dateStart, $lt: dateEnd } }).exec();
    }

    @Mutation(() => Author)
    createAuthor(
        @Arg('name') name: string,
        @Arg('surname') surname: string,
        @Arg('dateOfBirth') dateOfBirth: string,
        @Ctx() { Authors }: Context,
    ): Promise<AuthorType> {
        return new Authors({ name, surname, dateOfBirth: new Date(dateOfBirth) }).save();
    }
}

@Resolver(Book)
export class BookResolver {
    @Query(() => Book, { nullable: true })
    async book(@Arg('id', () => ID) id: string, @Ctx() { Books }: Context): Promise<BookType> {
        const book = await Books.load(id);
        if (!book) throw new Error('Book not found');

        return book;
    }

    @Query(() => [Book])
    books(@Ctx() { Books }: Context): Promise<BookType[]> {
        return Books.find({}).exec();
    }

    @Query(() => [Book])
    booksByGenre(
        @Arg('genre', () => BookGenresEnum) genre: BookGenresEnum,
        @Ctx() { Books }: Context,
    ): Promise<BookType[]> {
        return Books.find({ genre }).exec();
    }

    @Mutation(() => Book)
    createBook(
        @Arg('title') title: string,
        @Arg('genre', () => BookGenresEnum) genre: BookGenresEnum,
        @Arg('author', () => ID) author: string,
        @Ctx() { Books }: Context,
    ): Promise<BookType> {
        return new Books({ title, genre, author }).save();
    }
}
