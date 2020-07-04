import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ObjectId } from 'mongodb';

class MockDbServer {
    private server = new MongoMemoryServer();

    async init() {
        const url = await this.server.getUri();
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        });

        return this;
    }

    async stop() {
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
        await this.server.stop();
    }
}

export default (): Promise<MockDbServer> => new MockDbServer().init();

export function normalize<T>({
    _id,
    __v,
    ...rest
}: T & { _id: ObjectId; __v: string }): T & { id: string } {
    return ({ ...rest, id: String(_id) } as unknown) as T & { id: string };
}
