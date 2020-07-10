import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './schema';
import resolvers from './resolvers';

export { default as Author } from './models/Author.model';
export { default as Book } from './models/Book.model';
export { default as initMongo } from '@/common/MockMongoServer';

export default makeExecutableSchema({
    typeDefs,
    resolvers,
});
