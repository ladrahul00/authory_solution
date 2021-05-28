import { Controller, Get } from '@nestjs/common';
import { ArticleService } from './article.service';

@Controller("/article")
export class ArticleController {
    constructor(private readonly articleService: ArticleService) { }

    @Get()
    public getHello(): string {
        return this.articleService.getHello();
    }
}
