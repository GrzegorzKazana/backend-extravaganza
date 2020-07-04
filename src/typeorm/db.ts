import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';

import Author from './Author.model';
import Book from './Book.model';

export default (): Promise<Connection> =>
    createConnection({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [Author, Book],
    });
