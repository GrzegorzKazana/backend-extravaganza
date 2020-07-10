import 'reflect-metadata';

import { buildSchemaSync } from 'type-graphql';

import { AuthorResolver, BookResolver } from './resolvers';

export { default as initMongo } from '@/common/MockMongoServer';
export { default as Author } from './models/Author.model';
export { default as Book } from './models/Book.model';

export default buildSchemaSync({
    resolvers: [AuthorResolver, BookResolver],
    emitSchemaFile: true,
});
