import request from 'supertest';

import App from '../app';
import { mockAuthor, mockBooksByAuthor, mockBooks } from './mocks';
import { insertAuthorsToEndpoint, insertAuthorsAndBooksToEndpoint, queries } from './helpers';

/* eslint @typescript-eslint/no-unsafe-member-access: 0,
    @typescript-eslint/no-unsafe-return: 0,
    @typescript-eslint/no-unsafe-assignment: 0,
    @typescript-eslint/unbound-method: 0 */

describe('graphql functionality', () => {
    const endpoints = ['schema-first', 'code-first', 'mongo-gql'];
    const randomId = '5f00dc3ab10865ddc45eebf1';

    let server = new App();

    beforeEach(() =>
        new App().init().then(app => {
            server = app;
        }),
    );

    afterEach(() => server.teardown());

    endpoints.forEach(endpoint => {
        const insertAuthors = insertAuthorsToEndpoint(endpoint);
        const insertAuthorsAndBooks = insertAuthorsAndBooksToEndpoint(endpoint);

        describe(`with '/${endpoint}'`, () => {
            describe('in author type', () => {
                it('allows for data insertion', async () => {
                    const { app } = server;
                    await insertAuthors(app);

                    const authors = await request(app)
                        .post(`/${endpoint}`)
                        .send({ query: queries.authors })
                        .then(({ body }) => body.data.authors);

                    expect(authors).toHaveLength(mockAuthor.length);
                    expect(authors).toEqual(
                        expect.arrayContaining(
                            mockAuthor.map(author =>
                                expect.objectContaining({
                                    id: expect.any(String),
                                    name: author.name,
                                    surname: author.surname,
                                    dateOfBirth: author.dateOfBirth.toISOString(),
                                }),
                            ),
                        ),
                    );
                });

                it('allows for getting author by id', async () => {
                    const { app } = server;
                    const [insertedAuthor] = await insertAuthors(app);

                    const { author } = await request(app)
                        .post(`/${endpoint}`)
                        .send({
                            query: queries.author,
                            variables: { id: insertedAuthor.id },
                        })
                        .then(({ body }) => body.data);

                    expect(author).toEqual(
                        expect.objectContaining({
                            id: expect.any(String),
                            name: insertedAuthor.name,
                            surname: insertedAuthor.surname,
                            dateOfBirth: insertedAuthor.dateOfBirth,
                        }),
                    );
                });

                it('return errors and null data if author with id does not exist', async () => {
                    const res = await request(server.app)
                        .post(`/${endpoint}`)
                        .send({
                            query: queries.author,
                            variables: { id: randomId },
                        })
                        .then(({ body }) => body);

                    expect(res).not.toBe(undefined);
                    expect(res.errors).toHaveProperty('length');
                    expect(res.data.author).toBe(null);
                });

                it('allows for querying authors by year', async () => {
                    const { app } = server;
                    await insertAuthors(app);

                    const year = 1926;
                    const expectedAuthors = mockAuthor.filter(
                        ({ dateOfBirth }) => dateOfBirth.getFullYear() === year,
                    );

                    const { authorsByYear } = await request(app)
                        .post(`/${endpoint}`)
                        .send({ query: queries.authorsByYear, variables: { year } })
                        .then(({ body }) => body.data);

                    expect(authorsByYear).toHaveLength(expectedAuthors.length);
                    expect(authorsByYear).toEqual(
                        expect.arrayContaining(
                            expectedAuthors.map(author =>
                                expect.objectContaining({
                                    id: expect.any(String),
                                    name: author.name,
                                    surname: author.surname,
                                    dateOfBirth: author.dateOfBirth.toISOString(),
                                }),
                            ),
                        ),
                    );
                });

                it('allows for fetching author with nested properties', async () => {
                    const { app } = server;
                    const {
                        authors: [insertedAuthor],
                    } = await insertAuthorsAndBooks(app);

                    const { author } = await request(app)
                        .post(`/${endpoint}`)
                        .send({
                            query: queries.authorWithBooks,
                            variables: { id: insertedAuthor.id },
                        })
                        .then(({ body }) => body.data);

                    expect(author).toEqual(
                        expect.objectContaining({
                            id: expect.any(String),
                            name: insertedAuthor.name,
                            surname: insertedAuthor.surname,
                            dateOfBirth: insertedAuthor.dateOfBirth,
                            books: expect.arrayContaining(
                                mockBooksByAuthor[insertedAuthor.surname].map(book =>
                                    expect.objectContaining({ title: book.title }),
                                ),
                            ),
                        }),
                    );
                });
            });

            describe('in book type', () => {
                it('allows for insering and fetching data', async () => {
                    const { app } = server;
                    await insertAuthorsAndBooks(app);

                    const { books } = await request(app)
                        .post(`/${endpoint}`)
                        .send({ query: queries.books })
                        .then(({ body }) => body.data);

                    expect(books).toHaveLength(mockBooks.length);
                    expect(books).toEqual(
                        expect.arrayContaining(
                            mockBooks.map(mockBook =>
                                expect.objectContaining({
                                    id: expect.any(String),
                                    title: mockBook.title,
                                    genre: mockBook.genre,
                                }),
                            ),
                        ),
                    );
                });

                it('allows for getting book by id', async () => {
                    const { app } = server;
                    const [insertedBook] = (await insertAuthorsAndBooks(app)).books;

                    const { book } = await request(app)
                        .post(`/${endpoint}`)
                        .send({ query: queries.book, variables: { id: insertedBook.id } })
                        .then(({ body }) => body.data);

                    expect(book).toEqual(
                        expect.objectContaining({
                            id: insertedBook.id,
                        }),
                    );
                });

                it('returns 404 if book with id does not exist', async () => {
                    const { app } = server;

                    const res = await request(app)
                        .post(`/${endpoint}`)
                        .send({ query: queries.book, variables: { id: randomId } })
                        .then(({ body }) => body);

                    expect(res).toHaveProperty('errors');
                    expect(res.data.book).toBe(null);
                });

                it('return books by genre', async () => {
                    const { app } = server;
                    await insertAuthorsAndBooks(app);

                    const fantasyBooks = mockBooks.filter(({ genre }) => genre === 'FANTASY');

                    const { booksByGenre } = await request(app)
                        .post(`/${endpoint}`)
                        .send({ query: queries.booksByGenre, variables: { genre: 'FANTASY' } })
                        .then(({ body }) => body.data);

                    expect(booksByGenre).toHaveLength(fantasyBooks.length);
                    expect(booksByGenre).toEqual(
                        expect.arrayContaining(
                            fantasyBooks.map(book =>
                                expect.objectContaining({
                                    title: book.title,
                                    genre: book.genre,
                                }),
                            ),
                        ),
                    );
                });

                it('allows for quering author info for book', async () => {
                    const { app } = server;
                    const [insertedBook] = (await insertAuthorsAndBooks(app)).books;

                    const { book } = await request(app)
                        .post(`/${endpoint}`)
                        .send({ query: queries.bookWithAuthor, variables: { id: insertedBook.id } })
                        .then(({ body }) => body.data);

                    const authorSurname = Object.entries(mockBooksByAuthor).find(([_, books]) =>
                        books.find(book => book.title === insertedBook.title),
                    )?.[0];

                    expect(book).toEqual(
                        expect.objectContaining({
                            id: insertedBook.id,
                            title: insertedBook.title,
                            genre: insertedBook.genre,
                            author: expect.objectContaining({
                                surname: authorSurname,
                            }),
                        }),
                    );
                });
            });
        });
    });
});
