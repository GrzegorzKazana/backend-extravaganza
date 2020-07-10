import type { BookProps, Book as IBook } from '../../common/types';

import { Schema, model, Document, Model } from 'mongoose';

import { normalize } from '@/common/MockMongoServer';

import { createMongoDataLoader } from '../../common/createMongoDataLoader';

const bookSchema = new Schema({
    title: String,
    genre: String,
    author: { type: Schema.Types.ObjectId, ref: 'Authors' },
});

bookSchema.methods.toDTO = function (this: Document) {
    return normalize<BookProps>(this.toObject());
};

(bookSchema.statics as Record<string, unknown>).load = batchedLoad;

export interface BookType extends Document, BookProps {
    readonly id: string;
    toDTO: () => IBook;
}

export interface BookModel extends Model<BookType> {
    load: (id: string) => Promise<BookType>;
}

const Book = model<BookType>('Books', bookSchema);

const dataLoader = createMongoDataLoader(Book);

function batchedLoad(this: Document, id: string): Promise<BookType> {
    return dataLoader.load(id);
}

export default Book;
