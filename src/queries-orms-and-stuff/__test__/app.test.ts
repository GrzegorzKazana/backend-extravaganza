import request from 'supertest';

import App from '../app';
import { mockAuthor, mockBooksByAuthor, mockBooks } from './mocks';
import { insertAuthorsToRepo, insertAuthorsAndBooksToRepo } from './helpers';

/* eslint @typescript-eslint/no-unsafe-member-access: 0,
    @typescript-eslint/no-unsafe-return: 0,
    @typescript-eslint/no-unsafe-assignment: 0 */

describe('app functionality', () => {
    const repos = ['inmemory', 'sqlite', 'knex', 'typeorm', 'mongo'];
    const randomId = '5f00dc3ab10865ddc45eebf1';

    let server = new App();

    beforeEach(() =>
        new App().init().then(app => {
            server = app;
        }),
    );

    afterEach(() => server.teardown());

    repos.forEach(repo => {
        const insertAuthors = insertAuthorsToRepo(repo);
        const insertAuthorsAndBooks = insertAuthorsAndBooksToRepo(repo);

        describe(`with '${repo}' used as repository`, () => {
            describe('in author module', () => {
                it('allows for data insertion', async () => {
                    const { app } = server;
                    await insertAuthors(app);

                    const res = await request(app).get(`/${repo}/author`);

                    expect(res.body.authors).toHaveLength(mockAuthor.length);
                    expect(res.body.authors).toEqual(
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
                        .get(`/${repo}/author/${insertedAuthor.id}`)
                        .then(({ body }) => body);

                    expect(author).toEqual(
                        expect.objectContaining({
                            id: expect.any(String),
                            name: insertedAuthor.name,
                            surname: insertedAuthor.surname,
                            dateOfBirth: insertedAuthor.dateOfBirth,
                        }),
                    );
                });

                it('return 404 if author with id does not exist', () =>
                    request(server.app).get(`/${repo}/author/${randomId}`).expect(404));

                it('allows for querying authors by year', async () => {
                    const { app } = server;
                    await insertAuthors(app);

                    const year = 1926;
                    const expectedAuthors = mockAuthor.filter(
                        ({ dateOfBirth }) => dateOfBirth.getFullYear() === year,
                    );

                    const { authors } = await request(app)
                        .get(`/${repo}/author`)
                        .query({ year })
                        .then(({ body }) => body);

                    expect(authors).toHaveLength(expectedAuthors.length);
                    expect(authors).toEqual(
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

                it('allows for updating author', async () => {
                    const { app } = server;
                    const [insertedAuthor] = await insertAuthors(app);

                    const name = 'alternative name';
                    const { author: patchedAuthor } = await request(app)
                        .patch(`/${repo}/author/${insertedAuthor.id}`)
                        .send({ name })
                        .then(({ body }) => body);

                    const { author: queriedAuthor } = await request(app)
                        .get(`/${repo}/author/${insertedAuthor.id}`)
                        .then(({ body }) => body);

                    expect(patchedAuthor).toEqual(queriedAuthor);
                    expect(patchedAuthor).toEqual(
                        expect.objectContaining({ ...insertedAuthor, name }),
                    );
                });

                it('returns 404 if updated author does not exists', () =>
                    request(server.app)
                        .patch(`/${repo}/author/${randomId}`)
                        .send({ name: 'asd' })
                        .expect(404));
            });

            describe('in book module', () => {
                it('allows for insering and fetching data', async () => {
                    const { app } = server;
                    await insertAuthorsAndBooks(app);

                    const { books } = await request(app)
                        .get(`/${repo}/book`)
                        .then(({ body }) => body);

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
                        .get(`/${repo}/book/${insertedBook.id}`)
                        .then(({ body }) => body);

                    expect(book).toEqual(insertedBook);
                });

                it('returns 404 if book with id does not exist', () =>
                    request(server.app).get(`/${repo}/book/${randomId}`).expect(404));

                it('returns books by authors', async () => {
                    const { app } = server;
                    const { authors } = await insertAuthorsAndBooks(app);

                    const orwellId = authors.find(({ surname }) => surname === 'Orwell')?.id || '';

                    const { books: orwellBooks } = await request(app)
                        .get(`/${repo}/book`)
                        .query({ authorId: orwellId })
                        .then(({ body }) => body);

                    expect(orwellBooks).toHaveLength(mockBooksByAuthor.Orwell.length);
                    expect(orwellBooks).toEqual(
                        expect.arrayContaining(
                            mockBooksByAuthor.Orwell.map(book =>
                                expect.objectContaining({
                                    title: book.title,
                                    genre: book.genre,
                                    author: orwellId,
                                }),
                            ),
                        ),
                    );
                });

                it('return books by genre', async () => {
                    const { app } = server;
                    await insertAuthorsAndBooks(app);

                    const fantasyBooks = mockBooks.filter(({ genre }) => genre === 'Fantasy');

                    const { books } = await request(app)
                        .get(`/${repo}/book`)
                        .query({ genre: 'fantasy' })
                        .then(({ body }) => body);

                    expect(books).toHaveLength(fantasyBooks.length);
                    expect(books).toEqual(
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

                it('supports pagination', async () => {
                    const { app } = server;
                    await insertAuthorsAndBooks(app);

                    const { books: paginatedBooks } = await request(app)
                        .get(`/${repo}/book`)
                        .query({ from: 2, count: 3 })
                        .then(({ body }) => body);

                    expect(paginatedBooks).toHaveLength(3);
                });

                it('handles invalid pagination', async () => {
                    const { app } = server;
                    await insertAuthorsAndBooks(app);

                    const { books: paginatedBooks } = await request(app)
                        .get(`/${repo}/book`)
                        .query({ from: 0, count: -2 })
                        .then(({ body }) => body);

                    expect(paginatedBooks).toHaveLength(0);
                });
            });
        });
    });
});
