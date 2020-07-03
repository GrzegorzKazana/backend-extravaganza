import knex from 'knex';

export default (): knex =>
    knex({
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: ':memory:',
        },
    });
