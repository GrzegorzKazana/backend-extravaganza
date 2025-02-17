import type { Repository } from '../types';

export const BookGenres = {
    scifi: 'Science Fiction',
    novel: 'Novel',
    horror: 'Horror',
    fantasy: 'Fantasy',
} as const;

export const BookGenreRegex = new RegExp(`${Object.values(BookGenres).join('|')}`, 'i');

export type BookGenre = typeof BookGenres[keyof typeof BookGenres];

export interface BookProps {
    title: string;
    author: string;
    genre: BookGenre;
}

export interface Book extends BookProps {
    id: string;
}

export interface BookRepository extends Repository<BookProps, Book> {
    getBooksByAuthor(authorId: string): Promise<Book[]>;
    getBooks(from?: number, count?: number): Promise<Book[]>;
    getBooksByGenre(genre: BookGenre): Promise<Book[]>;
}
