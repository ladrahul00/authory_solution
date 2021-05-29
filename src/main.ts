import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { ArticleService } from './article/article.service';
import { DatabaseService } from './commons/db';
import { Resource } from './commons/types';

export class Main {
  private static globalInstance_?: Main;
  private readonly name2resource: Map<Function, Resource>;
  private readonly resources: Resource[];
  private application_?: INestApplication;
  private readonly databaseService_: DatabaseService;

  constructor() {
    this.name2resource = new Map<Function, Resource>();
    this.resources = [];
    this.application_ = undefined;
    this.registerResource(AppService, new AppService());
    this.registerResource(ArticleService, new ArticleService());
    this.databaseService_ = new DatabaseService();
    this.resources.push(this.databaseService_);
  }

  public static globalInstance(): Main {
    if (!Main.globalInstance_)
      throw new Error('main has not been initialized yet');
    return Main.globalInstance_;
  }

  public static async finalize(): Promise<void> {
    await Main.globalInstance().finalizeImpl();
  }

  public static async initialize(): Promise<void> {
    if (Main.globalInstance_)
      throw new Error('main has already been initialized');
    Main.globalInstance_ = new Main();
    await Main.globalInstance_.initializeImpl();
  }

  public static databaseService(): DatabaseService {
    return Main.globalInstance().databaseServiceImpl();
  }

  private databaseServiceImpl(): DatabaseService {
    return this.databaseService_;
  }

  public static resource(resourceName: Function): Resource {
    return Main.globalInstance().resourceImpl(resourceName);
  }

  private resourceImpl(resourceName: Function): Resource {
    if (!this.name2resource.has(resourceName)) {
      throw new Error('resource has not been registered');
    }
    return this.name2resource.get(resourceName);
  }

  public static async run(): Promise<void> {
    await Main.initialize();
    try {
      await Main.globalInstance().runImpl();
    } catch (error) {
      await Main.finalize();
    }
  }

  private application(): INestApplication {
    if (!this.application_) {
      throw new Error('application has not been initialized yet');
    }
    return this.application_;
  }

  private registerResource(name: Function, resource: Resource): void {
    this.name2resource.set(name, resource);
    this.resources.push(resource);
  }

  private async runImpl(): Promise<void> {
    const port = 3000;
    try {
      console.log(`listening on port ${port}`);
      await this.application().listen(port);
    } catch (error) {
      console.error('failed to start the application');
      throw error;
    }
  }

  private async initializeImpl(): Promise<void> {
    this.application_ = await NestFactory.create(AppModule);
    this.application_.useGlobalPipes(new ValidationPipe());
    for (const resource of this.resources) {
      await resource.prepare();
    }
  }

  private async finalizeImpl(): Promise<void> {
    for (const resource of this.resources) {
      await resource.destroy();
    }
    await this.application().close();
  }
}

async function bootstrap() {
  await Main.run();
}
bootstrap();
