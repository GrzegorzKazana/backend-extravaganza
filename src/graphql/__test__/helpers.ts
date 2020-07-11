import type { Express } from 'express';

import type { Author, AuthorProps, Book, BookProps } from '../common/types';

import request from 'supertest';

import { mockAuthor, mockBooksByAuthor } from './mocks';

/* eslint @typescript-eslint/no-unsafe-member-access: 0,
    @typescript-eslint/no-unsafe-return: 0 */

export const queries = {
    book: 'query($id: ID!) { book (id: $id) { id, title, genre } }',
    bookWithAuthor:
        'query($id: ID!) { book (id: $id) { id, title, genre, author { id, surname } } }',
    books: 'query { books { id, title, genre } }',
    booksByGenre: 'query($genre: BookGenre!) { booksByGenre(genre: $genre) { id, title, genre } }',
    author: 'query($id: ID!) { author (id: $id) { id, name, surname, dateOfBirth } }',
    authorWithBooks:
        'query($id: ID!) { author (id: $id) { id, name, surname, dateOfBirth, books { id, title } } }',
    authors: 'query { authors { id, name, surname, dateOfBirth } }',
    authorsByYear:
        'query($year: Int!) { authorsByYear(year: $year) { id, name, surname, dateOfBirth } }',
};

const mutations = {
    createAuthor: `mutation($name: String!, $surname: String!, $dateOfBirth: String!) {
        createAuthor(name: $name, surname: $surname, dateOfBirth: $dateOfBirth) { id, name, surname, dateOfBirth }
    }`,
    createBook: `mutation($title: String!, $genre: BookGenre!, $author: ID!) {
        createBook(title: $title, genre: $genre, author: $author) { id, title, genre }
    }`,
};

const insertAuthorToEndpoint = (baseUrl: string) => (app: Express) => (
    author: AuthorProps,
): Promise<Author> =>
    request(app)
        .post(`/${baseUrl}`)
        .send({
            query: mutations.createAuthor,
            variables: {
                ...author,
                dateOfBirth: author.dateOfBirth.toISOString(),
            },
        })
        .then(({ body }) => body.data.createAuthor);

export const insertAuthorsToEndpoint = (baseUrl: string) => (app: Express): Promise<Author[]> =>
    Promise.all(mockAuthor.map(insertAuthorToEndpoint(baseUrl)(app)));

const insertBookToEndpoint = (baseUrl: string) => (app: Express) => (
    book: BookProps,
): Promise<Book> =>
    request(app)
        .post(`/${baseUrl}`)
        .send({
            query: mutations.createBook,
            variables: book,
        })

        .then(({ body }) => body.data.createBook);

const insertBooksByAuthorToEndpoint = (baseUrl: string) => (app: Express) => (
    author: Author,
    books: BookProps[],
): Promise<Book[]> =>
    Promise.all(
        books.map(book => insertBookToEndpoint(baseUrl)(app)({ ...book, author: author.id })),
    );

export const insertAuthorsAndBooksToEndpoint = (baseUrl: string) => (
    app: Express,
): Promise<{ books: Book[]; authors: Author[] }> =>
    insertAuthorsToEndpoint(baseUrl)(app).then(authors =>
        Promise.all(
            authors.map(author =>
                insertBooksByAuthorToEndpoint(baseUrl)(app)(
                    author,
                    mockBooksByAuthor[author.surname],
                ),
            ),
        ).then(booksNested => ({
            authors,
            books: ([] as Book[]).concat(...booksNested),
        })),
    );
