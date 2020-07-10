import { Document, Model, FilterQuery } from 'mongoose';
import DataLoader from 'dataloader';

export const createMongoDataLoader = <D extends Document = Document>(
    model: Model<D>,
): DataLoader<string, D> =>
    new DataLoader<string, D>(async ids => {
        const data = await model.find({ _id: { $in: ids } } as FilterQuery<D>).exec();
        const dataById = data.reduce<Record<string, D>>((acc, result) => {
            acc[String(result._id)] = result;
            return acc;
        }, {});

        return ids.map(id => dataById[id] || null);
    });
