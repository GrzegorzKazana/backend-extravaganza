import { Router } from 'express';

import createAuthorRouter from '../rest/common/author/Author.router';
import createAuthorController from '../rest/common/author/Author.controller';

import createBookRouter from '../rest/common/book/Book.router';
import createBookController from '../rest/common/book/Book.controller';

import * as InMem from '../rest/inmemory';

const immemoryRouter = Router()
    .use('/book', createBookRouter(createBookController(new InMem.BookRepo())))
    .use('/author', createAuthorRouter(createAuthorController(new InMem.AuthorRepo())));

export default Router().use('/inmemory', immemoryRouter);
