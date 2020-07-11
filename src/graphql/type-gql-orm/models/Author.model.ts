import { BaseEntity, Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';
import { v4 as uuid } from 'uuid';

import { BookGenresEnum } from '@/graphql/common/types';

import Book from './Book.model';

@ObjectType()
@Entity()
export default class Author extends BaseEntity {
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
    @Column({ type: 'enum', enum: BookGenresEnum, nullable: false })
    dateOfBirth!: BookGenresEnum;

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
}
