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

export interface AuthorProps {
    name: string;
    surname: string;
    dateOfBirth: Date;
}

export interface Author extends AuthorProps {
    id: string;
}

export type AuthorDb = Omit<Author, 'dateOfBirth'> & { dateOfBirth: number };
