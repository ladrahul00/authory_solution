import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Main } from '../appMain';

@Module({
    controllers: [ArticleController],
    providers: [
        {
            provide: ArticleService.name,
            useFactory: () => Main.resource(ArticleService),
        },
    ],
})
export class ArticleModule {}
