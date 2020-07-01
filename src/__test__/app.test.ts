import type { Author } from '../common/author/Author.models';
import type { Book, BookProps } from '../common/book/Book.models';

import request from 'supertest';
import { Express } from 'express';

import App from '../app';
import { mockAuthor, mockBooksByAuthor, mockBooks } from './mocks';

/* eslint @typescript-eslint/no-unsafe-member-access: 0,
    @typescript-eslint/unbound-method: 0,
    @typescript-eslint/no-unsafe-return: 0,
    @typescript-eslint/no-unsafe-assignment: 0 */

describe('app functionality', () => {
    const repos = ['inmemory'];
    const getApp = () => new App().app;

    repos.forEach(repo => {
        describe(`with '${repo}' used as repository`, () => {
            const insertAuthors = (app: Express): Promise<Author[]> =>
                Promise.all(
                    mockAuthor.map(author =>
                        request(app)
                            .post(`/${repo}/author`)
                            .send({
                                ...author,
                                dateOfBirth: author.dateOfBirth.toISOString().substr(0, 10),
                            })
                            .then(({ body }) => body.author),
                    ),
                );

            const insertBook = (app: Express) => (book: BookProps): Promise<Book> =>
                request(app)
                    .post(`/${repo}/book`)
                    .send(book)
                    .then(({ body }) => body.book);

            const insertBooksByAuthor = (app: Express) => (
                author: Author,
                books: BookProps[],
            ): Promise<Book[]> =>
                Promise.all(books.map(book => insertBook(app)({ ...book, author: author.id })));

            const insertAuthorsAndBooks = (
                app: Express,
            ): Promise<{ books: Book[]; authors: Author[] }> =>
                insertAuthors(app).then(authors =>
                    Promise.all(
                        authors.map(author =>
                            insertBooksByAuthor(app)(author, mockBooksByAuthor[author.surname]),
                        ),
                    ).then(booksNested => ({
                        authors,
                        books: ([] as Book[]).concat(...booksNested),
                    })),
                );

            describe('in author module', () => {
                it('allows for data insertion', async () => {
                    const app = getApp();
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
                    const app = getApp();
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
                    request(getApp()).get(`/${repo}/author/asd`).expect(404));

                it('allows for querying authors by year', async () => {
                    const app = getApp();
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
                    const app = getApp();
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
                    request(getApp())
                        .patch(`/${repo}/author/asd`)
                        .send({ name: 'asd' })
                        .expect(404));
            });

            describe('in book module', () => {
                it('allows for insering and fetching data', async () => {
                    const app = getApp();
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
                    const app = getApp();
                    const [insertedBook] = (await insertAuthorsAndBooks(app)).books;

                    const { book } = await request(app)
                        .get(`/${repo}/book/${insertedBook.id}`)
                        .then(({ body }) => body);

                    expect(book).toEqual(insertedBook);
                });

                it('returns 404 if book with id does not exist', () =>
                    request(getApp()).get(`/${repo}/book/asd`).expect(404));

                it('returns books by authors', async () => {
                    const app = getApp();
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
                    const app = getApp();
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
                    const app = getApp();
                    const { books } = await insertAuthorsAndBooks(app);

                    const { books: paginatedBooks } = await request(app)
                        .get(`/${repo}/book`)
                        .query({ from: 2, count: 3 })
                        .then(({ body }) => body);

                    expect(paginatedBooks).toHaveLength(3);
                    expect(paginatedBooks).toEqual(
                        expect.arrayContaining(
                            books.slice(2, 5).map(book =>
                                expect.objectContaining({
                                    title: book.title,
                                    genre: book.genre,
                                }),
                            ),
                        ),
                    );
                });

                it('handles invalid pagination', async () => {
                    const app = getApp();
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
