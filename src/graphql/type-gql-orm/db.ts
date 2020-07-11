import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';

import Author from './models/Author.model';
import Book from './models/Book.model';

export default (): Promise<Connection> =>
    createConnection({
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
        entities: [Author, Book],
    });
