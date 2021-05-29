import { AAsyncResource } from './types'
import { Pool, PoolConfig, QueryResult } from 'pg'

export class DatabaseService extends AAsyncResource {
    private readonly connectionString: string
    private readonly connectionPoolConfig: PoolConfig

    constructor() {
        super()
        this.connectionString = process.env.DATABASE_CONNECTION_STRING
        this.connectionPoolConfig = {
            max: 20,
            connectionString: this.connectionString,
            idleTimeoutMillis: 30000,
        }
    }

    public async executeQuery(queryString: string): Promise<QueryResult> {
        const pool = new Pool(this.connectionPoolConfig)
        const client = await pool.connect()
        let queryResponse: QueryResult | undefined
        try {
            queryResponse = await client.query(queryString)
        } catch (error) {
            console.error("failed to connect to database");
            throw error
        } finally {
            try {
                client.release();
                console.debug("released database client");
            } catch (error) {
                throw error;
            } finally {
                await pool.end();
                console.debug("closing the connection pool");
            }
        }
        return queryResponse
    }

    public async destroy(): Promise<void> {
        return Promise.resolve()
    }

    public async prepare(): Promise<void> {
        const pool = new Pool(this.connectionPoolConfig)
        const client = await pool.connect()
        console.log('connection to database has been verified')
        try {
            client.release()
        } catch (error) {
            console.error('failed to connect to database')
            throw error
        } finally {
            await pool.end()
            console.debug("closing the connection pool");
        }
    }
}
