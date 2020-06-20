import type { BookRepository } from '../book/Book.models';

import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

import createBookRouter from '../book/Book.router';
import createBookController from '../book/Book.controller';

/* eslint @typescript-eslint/unbound-method: 0, 
    @typescript-eslint/no-unsafe-assignment: 0 */

describe('book endpoint router', () => {
    const getMockRepository = (): BookRepository => ({
        getById: jest.fn(),
        exists: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        getBooks: jest.fn(),
        getBooksByAuthor: jest.fn(),
        getBooksByGenre: jest.fn(),
    });

    const getApp = () => {
        const repo = getMockRepository();
        const controller = createBookController(repo);
        const router = createBookRouter(controller);
        const app = express().use(bodyParser.json()).use('/', router);

        return { app, repo };
    };

    it('gets book by id', async () => {
        const { app, repo } = getApp();

        const bookId = 'asd';

        await request(app).get(`/${bookId}`);

        expect(repo.getById).toBeCalledTimes(1);
        expect(repo.getById).toHaveBeenNthCalledWith(1, bookId);
    });

    it('calls getByAuthor when provided query param', async () => {
        const { app, repo } = getApp();

        await request(app).get('/').query({ authorId: 'asd' });

        expect(repo.getBooksByAuthor).toBeCalledTimes(1);
        expect(repo.getBooksByAuthor).toHaveBeenNthCalledWith(1, 'asd');
    });

    it('calls getByGenre when provided with valid genre', async () => {
        const { app, repo } = getApp();

        await request(app).get('/').query({ genre: 'Novel' });

        expect(repo.getBooksByGenre).toBeCalledTimes(1);
        expect(repo.getBooksByGenre).toHaveBeenNthCalledWith(1, 'Novel');
    });

    it('calls getAll when provided with invalid genre', async () => {
        const { app, repo } = getApp();

        await request(app).get('/').query({ genre: 'Fake genre' });

        expect(repo.getBooksByGenre).toBeCalledTimes(0);
        expect(repo.getBooks).toBeCalledTimes(1);
    });

    it('calls paginated repository when provided query params', async () => {
        const { app, repo } = getApp();

        await request(app).get('/').query({ from: 10, count: 20 });

        expect(repo.getBooks).toBeCalledTimes(1);
        expect(repo.getBooks).toHaveBeenNthCalledWith(1, 10, 20);
    });

    it('calls default getAll when without query params', async () => {
        const { app, repo } = getApp();

        await request(app).get('/');

        expect(repo.getBooks).toBeCalledTimes(1);
        expect(repo.getBooks).toHaveBeenNthCalledWith(1);
    });

    it('calls save when posting', async () => {
        const { app, repo } = getApp();

        await request(app).post('/').send({
            title: 'a',
            author: 'b',
            genre: 'Novel',
        });

        expect(repo.save).toBeCalledTimes(1);
        expect(repo.save).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                title: 'a',
                author: 'b',
                genre: 'Novel',
            }),
        );
    });
});
