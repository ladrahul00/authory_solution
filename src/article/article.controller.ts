import { Controller, Get, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
import { IAnalyticsResponse, AnalyticsQueryParams } from './types';

@Controller()
export class ArticleController {
    constructor(private readonly articleService: ArticleService) {}

    @Get('/analytics')
    public async analytics(
        @Query() queryParams: AnalyticsQueryParams
    ): Promise<IAnalyticsResponse[]> {
        return this.articleService.analytics(
            queryParams.from,
            queryParams.orderBy,
            queryParams.to
        );
    }
}
