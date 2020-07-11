import { Resolver, FieldResolver, Root, Query, Arg, ID, Mutation } from 'type-graphql';

import { BookGenresEnum } from '@/graphql/common/types';

import Author from '../models/Author.model';
import Book from '../models/Book.model';

@Resolver(Book)
export default class BookResolver {
    @FieldResolver()
    async author(@Root() { author: id }: Book): Promise<Author> {
        const author = await Author.findOne(id);
        if (!author) throw new Error('Author not found');

        return author;
    }

    @Query(() => Book, { nullable: true })
    async book(@Arg('id', () => ID) id: string): Promise<Book> {
        const book = await Book.findOne(id);
        if (!book) throw new Error('Book not found');

        return book;
    }

    @Query(() => [Book])
    books(): Promise<Book[]> {
        return Book.find();
    }

    @Query(() => [Book])
    booksByGenre(@Arg('genre', () => BookGenresEnum) genre: BookGenresEnum): Promise<Book[]> {
        return Book.find({ where: { genre: genre } });
    }

    @Mutation(() => Book)
    createBook(
        @Arg('title') title: string,
        @Arg('genre', () => BookGenresEnum) genre: BookGenresEnum,
        @Arg('author', () => ID) author: string,
    ): Promise<Book> {
        return Book.fromDTO({ title, genre, author }).save();
    }
}
