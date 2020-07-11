import { BaseEntity, Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { registerEnumType, ObjectType, Field, ID } from 'type-graphql';
import { v4 as uuid } from 'uuid';

import { BookGenresEnum } from '@/graphql/common/types';

import Author from './Author.model';

registerEnumType(BookGenresEnum, {
    name: 'BookGenre',
});

@ObjectType()
@Entity()
export default class Book extends BaseEntity {
    @Field(() => ID)
    @PrimaryColumn({ nullable: false })
    id!: string;

    @Field()
    @Column({ nullable: false })
    title!: string;

    @Field(() => BookGenresEnum)
    @Column('string', { nullable: false })
    genre!: BookGenresEnum;

    @Field()
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
}
