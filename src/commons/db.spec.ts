import { DatabaseService } from './db';

describe('DatabaseService', () => {
    const OLD_ENV = process.env;
    beforeAll(async () => {
        process.env = { ...OLD_ENV }; // Make a copy
    });

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    beforeEach(() => {
        process.env.DATABASE_CONNECTION_STRING =
            'postgres://postgres:mysecretpassword@localhost:5432/authory';
    });

    it('queries in database successfully', async () => {
        const databaseService = new DatabaseService();
        const queryResponse = await databaseService.executeQuery(
            `SELECT * FROM "ShareCountHistory" LIMIT 1`
        );
        expect(queryResponse.rowCount).toBe(1);
    });

    it('fails to connect to database due to incorrect password', async () => {
        process.env.DATABASE_CONNECTION_STRING =
            'postgres://postgres:incorrectpassword@localhost:5432/authory';
        const databaseService = new DatabaseService();
        expect(databaseService.prepare()).rejects.toThrow();
    });
});
