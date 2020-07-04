import type { Author as AuthorDto, AuthorDb } from '../common/author/Author.models';

import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';

import Book from './Book.model';

@Entity()
export default class Author implements AuthorDb {
    @PrimaryColumn({ nullable: false })
    id: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    surname: string;

    @Column({ nullable: false })
    dateOfBirth: number;

    @OneToMany(() => Book, book => book.author)
    @Column()
    books: Book[] = [];

    constructor({ id, name, surname, dateOfBirth }: AuthorDto) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.dateOfBirth = dateOfBirth.getTime();
    }

    toDTO(): AuthorDto {
        const { id, name, surname, dateOfBirth } = this;

        return {
            id,
            name,
            surname,
            dateOfBirth: new Date(dateOfBirth),
        };
    }
}
