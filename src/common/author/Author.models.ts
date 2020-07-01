import type { Repository } from '../types';

export interface AuthorProps {
    name: string;
    surname: string;
    dateOfBirth: Date;
}

export interface Author extends AuthorProps {
    id: string;
}

export type AuthorDb = Omit<Author, 'dateOfBirth'> & { dateOfBirth: number };

export interface AuthorRepository extends Repository<AuthorProps, Author> {
    getAllAuthors(): Promise<Author[]>;
    getAuthorsFromYear(year: number): Promise<Author[]>;
}
