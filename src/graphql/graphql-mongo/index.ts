import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from '@/graphql/schema-first/schema';
import resolvers from './resolvers';

export { default as initMongo } from '@/common/MockMongoServer';
export default makeExecutableSchema({
    typeDefs,
    resolvers,
});
