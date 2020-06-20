import type { Author } from '../rest/common/author/Author.models';

import request from 'supertest';
import { Express } from 'express';

import App from '../app';
import { mockAuthor } from './mocks';

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
        });
    });
});
