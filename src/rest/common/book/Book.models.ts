import type { Repository } from '../types';

export type BookGenre = 'Science Fiction' | 'Novel' | 'Horror';

export interface Book {
    title: string;
    author: string;
    genre: BookGenre;
}

export interface BookRepository extends Repository<Book> {
    getBooksByAuthor(authorId: string): Promise<Book[]>;
    getBooks(from: number, to: number): Promise<Book[]>;
    getBooksByGenre(genre: BookGenre): Promise<Book[]>;
}
