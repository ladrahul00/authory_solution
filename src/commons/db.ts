import { AAsyncResource } from "./types";

export class DatabaseService extends AAsyncResource
{
    private readonly connectionString: string;
    constructor(connectionString: string)
    {
        super();
        this.connectionString = connectionString;
    }

    public destroy(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public prepare(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}
