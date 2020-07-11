import { Resolver, FieldResolver, Root, Query, Arg, ID, Int, Mutation } from 'type-graphql';

import Author from '../models/Author.model';
import Book from '../models/Book.model';

@Resolver(Author)
export default class AuthorResolver {
    @FieldResolver()
    books(@Root() { id }: Book): Promise<Book[]> {
        return Book.find({ where: { author: id } });
    }

    @Query(() => Author, { nullable: true })
    async author(@Arg('id', () => ID) id: string): Promise<Author> {
        const author = await Author.findOne(id);
        if (!author) throw new Error('Author not found');

        return author;
    }

    @Query(() => [Author])
    authors(): Promise<Author[]> {
        return Author.find();
    }

    @Query(() => [Author])
    authorsByYear(@Arg('year', () => Int) year: number): Promise<Author[]> {
        const dateStart = new Date(year, 0, 1).toISOString();
        const dateEnd = new Date(year + 1, 0, 1).toISOString();

        return Author.createQueryBuilder()
            .where('dateOfBirth > :dateStart')
            .andWhere('dateOfBirth < :dateEnd')
            .setParameters({ dateStart, dateEnd })
            .getMany();
    }

    @Mutation(() => Author)
    createAuthor(
        @Arg('name') name: string,
        @Arg('surname') surname: string,
        @Arg('dateOfBirth') dateOfBirth: string,
    ): Promise<Author> {
        return Author.fromDTO({ name, surname, dateOfBirth }).save();
    }
}
