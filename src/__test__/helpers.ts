import type { Express } from 'express';

import type { Author, AuthorProps } from '../common/author/Author.models';
import type { Book, BookProps } from '../common/book/Book.models';

import request from 'supertest';

import { mockAuthor, mockBooksByAuthor } from './mocks';

/* eslint @typescript-eslint/no-unsafe-member-access: 0,
    @typescript-eslint/no-unsafe-return: 0 */

const insertAuthorToRepo = (baseUrl: string) => (app: Express) => (
    author: AuthorProps,
): Promise<Author> =>
    request(app)
        .post(`/${baseUrl}/author`)
        .send({
            ...author,
            dateOfBirth: author.dateOfBirth.toISOString().substr(0, 10),
        })
        .then(({ body }) => body.author);

export const insertAuthorsToRepo = (baseUrl: string) => (app: Express): Promise<Author[]> =>
    Promise.all(mockAuthor.map(insertAuthorToRepo(baseUrl)(app)));

const insertBookToRepo = (baseUrl: string) => (app: Express) => (book: BookProps): Promise<Book> =>
    request(app)
        .post(`/${baseUrl}/book`)
        .send(book)
        .then(({ body }) => body.book);

const insertBooksByAuthorToRepo = (baseUrl: string) => (app: Express) => (
    author: Author,
    books: BookProps[],
): Promise<Book[]> =>
    Promise.all(books.map(book => insertBookToRepo(baseUrl)(app)({ ...book, author: author.id })));

export const insertAuthorsAndBooksToRepo = (baseUrl: string) => (
    app: Express,
): Promise<{ books: Book[]; authors: Author[] }> =>
    insertAuthorsToRepo(baseUrl)(app).then(authors =>
        Promise.all(
            authors.map(author =>
                insertBooksByAuthorToRepo(baseUrl)(app)(author, mockBooksByAuthor[author.surname]),
            ),
        ).then(booksNested => ({
            authors,
            books: ([] as Book[]).concat(...booksNested),
        })),
    );
