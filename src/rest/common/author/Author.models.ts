import type { Repository } from '../types';

export interface Author {
    name: string;
    surname: string;
    dateOfBirth: Date;
}

export interface AuthorRepository extends Repository<Author> {
    getAllAuthors(): Promise<Author[]>;
    getAuthorsFromYear(year: number): Promise<Author[]>;
}
