import type { BookProps, Book as IBook } from '../../common/types';

import { Schema, model, Document } from 'mongoose';

import { normalize } from '@/common/MockMongoServer';

const bookSchema = new Schema({
    title: String,
    genre: String,
    author: { type: Schema.Types.ObjectId, ref: 'Authors' },
});

bookSchema.methods.toDTO = function (this: Document) {
    return normalize<BookProps>(this.toObject());
};

const Book = model<BooksType>('Books', bookSchema);

export interface BooksType extends Document, BookProps {
    toDTO: () => IBook;
}

export type BookModel = typeof Book;

export default Book;
