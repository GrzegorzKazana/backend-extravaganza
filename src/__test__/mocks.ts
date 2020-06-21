import type { BookProps } from '../rest/common/book/Book.models';
import type { AuthorProps } from '../rest/common/author/Author.models';

export const mockBooksByAuthor: Record<string, BookProps[]> = {
    Lee: [{ title: 'To Kill a Mockingbird', author: '', genre: 'Novel' }],
    Orwell: [
        { title: '1984', author: '', genre: 'Novel' },
        { title: 'Animal Farm', author: '', genre: 'Novel' },
    ],
    Tolkien: [{ title: 'The Lord of the Rings', author: '', genre: 'Fantasy' }],
    Salinger: [{ title: 'The Catcher in the Rye', author: '', genre: 'Novel' }],
    Fitzgerald: [{ title: 'The Great Gatsby', author: '', genre: 'Novel' }],
    Heller: [{ title: 'Catch-22', author: '', genre: 'Novel' }],
    Fowles: [{ title: 'The Collector', author: '', genre: 'Novel' }],
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
