import { Resource } from './commons/types';

export class AppService extends Resource {
    public getHello(): string {
        return 'Hello World!';
    }
}
