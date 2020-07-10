import { registerEnumType, ObjectType, Field, ID, Ctx, Root } from 'type-graphql';

import { BookGenresEnum } from '../common/types';
import { AuthorModel, AuthorType } from './models/Author.model';
import { BookModel, BookType } from './models/Book.model';

export type Context = {
    Authors: AuthorModel;
    Books: BookModel;
};

registerEnumType(BookGenresEnum, {
    name: 'BookGenre',
});

@ObjectType()
export class Author {
    @Field(() => ID)
    id!: string;

    @Field()
    name!: string;

    @Field()
    surname!: string;

    @Field()
    dateOfBirth(@Root() { dateOfBirth }: AuthorType): string {
        return dateOfBirth.toISOString();
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    @Field(() => [Book])
    books(@Root() { id }: AuthorType, @Ctx() { Books }: Context): Promise<BookType[]> {
        return Books.find({ author: id }).exec();
    }
}

@ObjectType()
export class Book {
    @Field(() => ID)
    id!: string;

    @Field()
    title!: string;

    @Field(() => BookGenresEnum)
    genre!: BookGenresEnum;

    @Field(() => Author)
    async author(
        @Root() { author: id }: BookType,
        @Ctx() { Authors }: Context,
    ): Promise<AuthorType> {
        const author = await Authors.load(id);
        if (!author) throw new Error('Author not found');

        return author;
    }
}
