import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './article/article.module';
import { Main } from './main';

@Module({
  imports: [ArticleModule],
  controllers: [AppController],
  providers: [
    {
      provide: AppService.name,
      useFactory: () => Main.resource(AppService),
    },
  ],
})
export class AppModule {}
