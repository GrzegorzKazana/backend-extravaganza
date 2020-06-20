import type { Server } from 'http';

import express, { Router } from 'express';
import bodyParser from 'body-parser';

import { serverErrorMiddleware } from './rest/common/errors';

import createAuthorRouter from './rest/common/author/Author.router';
import createAuthorController from './rest/common/author/Author.controller';

import createBookRouter from './rest/common/book/Book.router';
import createBookController from './rest/common/book/Book.controller';

import * as InMem from './rest/inmemory';

export default class App {
    public app = express();

    constructor(private port: number = 400) {
        this.app.use(bodyParser.json());
        this.app.use('/', this.createRouter());
        this.app.use(serverErrorMiddleware);
    }

    public listen(): Promise<Server> {
        return new Promise(resolve => this.app.listen(this.port, resolve));
    }

    private createRouter(): Router {
        const immemoryRouter = Router()
            .use('/book', createBookRouter(createBookController(new InMem.BookRepo())))
            .use('/author', createAuthorRouter(createAuthorController(new InMem.AuthorRepo())));

        return Router().use('/inmemory', immemoryRouter);
    }
}
