import type { Server } from 'http';

import express from 'express';
import bodyParser from 'body-parser';

import rootRouter from './config/rootRouter';
import { serverErrorMiddleware } from './rest/common/errors';

export default class App {
    private app = express();

    constructor(private port: number) {
        this.app.use(bodyParser.json());
        this.app.use('/', rootRouter);
        this.app.use(serverErrorMiddleware);
    }

    public listen(): Promise<Server> {
        return new Promise(resolve => this.app.listen(this.port, resolve));
    }
}
