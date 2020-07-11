import { BaseEntity, Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { registerEnumType, ObjectType, Field, ID } from 'type-graphql';
import { v4 as uuid } from 'uuid';

import { BookGenresEnum } from '@/graphql/common/types';
import { createTypeOrmDataLoader } from '@/graphql/common/createTypeOrmDataLoader';

import Author from './Author.model';

registerEnumType(BookGenresEnum, {
    name: 'BookGenre',
});

@ObjectType()
@Entity()
export default class Book extends BaseEntity {
    private static loader = createTypeOrmDataLoader(Book, ({ id }) => id);

    @Field(() => ID)
    @PrimaryColumn({ nullable: false })
    id!: string;

    @Field()
    @Column({ nullable: false })
    title!: string;

    @Field(() => BookGenresEnum)
    @Column('varchar', { nullable: false })
    genre!: BookGenresEnum;

    @Field(() => Author)
    @Column({ nullable: false })
    @ManyToOne(() => Author, author => author.books)
    author!: string;

    static fromDTO({
        title,
        genre,
        author,
    }: {
        title: string;
        genre: BookGenresEnum;
        author: string;
    }): Book {
        return Object.assign(new Book(), { id: uuid(), title, genre, author });
    }

    static load(id: string): Promise<Book | undefined> {
        return Book.loader.load(id);
    }
}
