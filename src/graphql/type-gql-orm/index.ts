import { buildSchemaSync } from 'type-graphql';

import AuthorResolver from './resolvers/Author.resolver';
import BookResolver from './resolvers/Book.resolver';

export { default as initTypeOrm } from './db';

export default buildSchemaSync({
    resolvers: [AuthorResolver, BookResolver],
});
