import knex from 'knex';

export default (): knex =>
    knex({
        client: 'sqlite3',
        connection: {
            filename: ':memory:',
        },
    });
