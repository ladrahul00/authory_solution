import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './article/article.module';
import { Main } from './appMain';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ArticleModule, ConfigModule.forRoot()],
    controllers: [AppController],
    providers: [
        {
            provide: AppService.name,
            useFactory: () => Main.resource(AppService),
        },
    ],
})
export class AppModule {}
