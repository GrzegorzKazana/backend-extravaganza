import { BaseEntity, Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { v4 as uuid } from 'uuid';

import { createTypeOrmDataLoader } from '@/graphql/common/createTypeOrmDataLoader';

import Book from './Book.model';

@ObjectType()
@Entity()
export default class Author extends BaseEntity {
    private static loader = createTypeOrmDataLoader(Author, ({ id }) => id);

    @Field(() => ID)
    @PrimaryColumn({ nullable: false })
    id!: string;

    @Field()
    @Column({ nullable: false })
    name!: string;

    @Field()
    @Column({ nullable: false })
    surname!: string;

    @Field()
    @Column({ nullable: false })
    dateOfBirth!: string;

    @Field(() => [Book])
    @OneToMany(() => Book, book => book.author)
    books!: Book[];

    static fromDTO({
        name,
        surname,
        dateOfBirth,
    }: {
        name: string;
        surname: string;
        dateOfBirth: string;
    }): Author {
        return Object.assign(new Author(), { id: uuid(), name, surname, dateOfBirth });
    }

    static load(id: string): Promise<Author | undefined> {
        return Author.loader.load(id);
    }
}
