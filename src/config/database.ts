import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export default (): Promise<Database> =>
    open({
        driver: sqlite3.Database,
        filename: ':memory:',
    });
