import { registerEnumType, ObjectType, Field, ID, Ctx, Root } from 'type-graphql';

import { BookGenresEnum } from '../common/types';
import { AuthorModel, AuthorType } from './models/Author.model';
import { BookModel, BookType } from './models/Book.model';

type Context = {
    Authors: AuthorModel;
    Books: BookModel;
};

registerEnumType(BookGenresEnum, {
    name: 'BookGenre',
});

@ObjectType()
export class Author {
    @Field(() => ID)
    public id!: string;

    @Field()
    public name!: string;

    @Field()
    public surname!: string;

    @Field()
    public dateOfBirth(@Root() { dateOfBirth }: AuthorType): string {
        return dateOfBirth.toISOString();
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    @Field(() => [Book])
    public books(@Root() { id }: AuthorType, @Ctx() { Books }: Context): Promise<BookType[]> {
        return Books.find({ author: id }).exec();
    }
}

@ObjectType()
export class Book {
    @Field(() => ID)
    public id!: string;

    @Field()
    public title!: string;

    @Field()
    public genre!: BookGenresEnum;

    @Field()
    public async author(
        @Root() { author: id }: BookType,
        @Ctx() { Authors }: Context,
    ): Promise<AuthorType> {
        const author = await Authors.findById(id).exec();
        if (!author) throw new Error('Author not found');

        return author;
    }
}
