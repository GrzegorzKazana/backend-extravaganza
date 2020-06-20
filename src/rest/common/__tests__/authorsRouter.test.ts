import type { AuthorRepository } from '../author/Author.models';

import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

import createAuthorRouter from '../author/Author.router';
import createAuthorController from '../author/Author.controller';

/* eslint @typescript-eslint/unbound-method: 0, 
    @typescript-eslint/no-unsafe-assignment: 0 */

describe('authors endpoint router', () => {
    const getMockRepository = (): AuthorRepository => ({
        getById: jest.fn(),
        exists: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        getAllAuthors: jest.fn(),
        getAuthorsFromYear: jest.fn(),
    });

    const getApp = () => {
        const repo = getMockRepository();
        const controller = createAuthorController(repo);
        const router = createAuthorRouter(controller);
        const app = express().use(bodyParser.json()).use('/', router);

        return { app, repo };
    };

    it('executes getByAll with valid prop', async () => {
        const { app, repo } = getApp();

        const authorId = 'asd';

        await request(app).get(`/${authorId}`);

        expect(repo.getById).toBeCalledTimes(1);
        expect(repo.getById).toHaveBeenNthCalledWith(1, authorId);
    });

    it('does request user by year query', async () => {
        const { app, repo } = getApp();

        await request(app).get('/').query({ year: 2020 });

        expect(repo.getAuthorsFromYear).toBeCalledTimes(1);
        expect(repo.getAuthorsFromYear).toHaveBeenNthCalledWith(1, 2020);
    });

    it('ignores getAuthorByYear if not provided', async () => {
        const { app, repo } = getApp();

        await request(app).get('/');

        expect(repo.getAllAuthors).toBeCalledTimes(1);
        expect(repo.getAllAuthors).toHaveBeenNthCalledWith(1);
    });

    it('allows for posting authors', async () => {
        const { app, repo } = getApp();

        await request(app).post('/').send({
            name: 'a',
            surname: 'b',
            dateOfBirth: '2020-01-01',
        });

        expect(repo.save).toBeCalledTimes(1);
        expect(repo.save).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                name: 'a',
                surname: 'b',
                dateOfBirth: expect.any(Date),
            }),
        );
    });
});
