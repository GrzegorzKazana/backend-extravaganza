import type { Book as IBook, BookGenre } from '../common/book/Book.models';

import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';

import Author from './Author.model';

@Entity()
export default class Book implements IBook {
    @PrimaryColumn({ nullable: false })
    id!: string;

    @Column({ nullable: false })
    title!: string;

    @Column({ nullable: false })
    genre!: BookGenre;

    @ManyToOne(() => Author, author => author.books)
    @Column({ nullable: false })
    author!: string;

    private constructor() {}

    public static fromDTO({ id, title, genre, author }: IBook): Book {
        return Object.assign(new Book(), { id, title, genre, author });
    }
}
