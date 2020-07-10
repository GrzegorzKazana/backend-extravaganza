export const BookGenres = {
    scifi: 'SCIFI',
    novel: 'NOVEL',
    horror: 'HORROR',
    fantasy: 'FANTASY',
} as const;

export enum BookGenresEnum {
    SCIFI = 'SCIFI',
    NOVEL = 'NOVEL',
    HORROR = 'HORROR',
    FANTASY = 'FANTASY',
}

export const BookGenreRegex = new RegExp(`${Object.values(BookGenres).join('|')}`, 'i');

export type BookGenre = typeof BookGenres[keyof typeof BookGenres];

export interface BookProps {
    title: string;
    author: string;
    genre: BookGenre;
}

export interface BookPropsEnum {
    title: string;
    author: string;
    genre: BookGenresEnum;
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
export type AuthorModel = Omit<Author, 'dateOfBirth'> & { dateOfBirth: string };
