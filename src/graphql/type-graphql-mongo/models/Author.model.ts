import type { AuthorProps, Author as IAuthor } from '../../common/types';

import { Schema, model, Document, Model } from 'mongoose';

import { normalize } from '@/common/MockMongoServer';

import { createMongoDataLoader } from '../../common/createMongoDataLoader';

const authorSchema = new Schema({
    name: String,
    surname: String,
    dateOfBirth: Date,
});

authorSchema.methods.toDTO = function (this: Document) {
    return normalize<AuthorProps>(this.toObject());
};

(authorSchema.statics as Record<string, unknown>).load = batchedLoad;

export interface AuthorType extends Document, AuthorProps {
    readonly id: string;
    toDTO: () => IAuthor;
}

export interface AuthorModel extends Model<AuthorType> {
    load: (id: string) => Promise<AuthorType>;
}

const Author = model<AuthorType, AuthorModel>('Author', authorSchema);

const dataLoader = createMongoDataLoader(Author);

function batchedLoad(this: Document, id: string): Promise<AuthorType> {
    return dataLoader.load(id);
}

export default Author;
