export abstract class AAsyncResource {
    public abstract destroy(): Promise<void>

    public abstract prepare(): Promise<void>
}

export class Resource implements AAsyncResource {
    public destroy(): Promise<void> {
        return Promise.resolve()
    }
    public prepare(): Promise<void> {
        return Promise.resolve()
    }
}
