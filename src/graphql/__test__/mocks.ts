import type { BookProps, AuthorProps } from '../common/types';

export const mockBooksByAuthor: Record<string, BookProps[]> = {
    Lee: [{ title: 'To Kill a Mockingbird', author: '', genre: 'NOVEL' }],
    Orwell: [
        { title: '1984', author: '', genre: 'NOVEL' },
        { title: 'Animal Farm', author: '', genre: 'NOVEL' },
    ],
    Tolkien: [{ title: 'The Lord of the Rings', author: '', genre: 'FANTASY' }],
    Salinger: [{ title: 'The Catcher in the Rye', author: '', genre: 'NOVEL' }],
    Fitzgerald: [{ title: 'The Great Gatsby', author: '', genre: 'NOVEL' }],
    Heller: [{ title: 'Catch-22', author: '', genre: 'NOVEL' }],
    Fowles: [{ title: 'The Collector', author: '', genre: 'NOVEL' }],
};

export const mockAuthorsByAuthor: Record<string, AuthorProps> = {
    Lee: { name: 'Harper', surname: 'Lee', dateOfBirth: new Date('1926-04-28') },
    Orwell: { name: 'George', surname: 'Orwell', dateOfBirth: new Date('1903-06-25') },
    Tolkien: { name: 'J.R.R.', surname: 'Tolkien', dateOfBirth: new Date('1892-01-03') },
    Salinger: { name: 'J.D.', surname: 'Salinger', dateOfBirth: new Date('1919-01-01') },
    Fitzgerald: { name: 'F. Scott', surname: 'Fitzgerald', dateOfBirth: new Date('1896-09-24') },
    Heller: { name: 'Joseph', surname: 'Heller', dateOfBirth: new Date('1923-05-01') },
    Fowles: { name: 'John', surname: 'Fowles', dateOfBirth: new Date('1926-03-31') },
};

export const mockAuthor: AuthorProps[] = Object.values(mockAuthorsByAuthor);
export const mockBooks: BookProps[] = ([] as BookProps[]).concat(
    ...Object.values(mockBooksByAuthor),
);
