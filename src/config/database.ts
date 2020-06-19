import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export default open({
    driver: sqlite3.Database,
    filename: ':memory:',
});
