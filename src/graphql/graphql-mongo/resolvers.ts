import type { Author as AuthorDb, Book as BookDb } from '../common/types';
import type {
    AuthorResolvers,
    BookResolvers,
    QueryResolvers,
    MutationResolvers,
} from './generated/types';
import type Author from './models/Author.model';
import type Book from './models/Book.model';
