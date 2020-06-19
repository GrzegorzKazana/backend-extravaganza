import type { RouteHandler } from '../types';
import type { BookRepository, Book } from './Book.models';

export interface BookController {}

export default function createBookController(bookRepository: BookRepository): BookController {
    return {};
}
