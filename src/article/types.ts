import { IsDateString, IsEnum, IsOptional } from 'class-validator'

export enum ShareSiteActions {
    FACEBOOK = 'facebook',
    TWITTER = 'twitter',
    PINTEREST = 'pinterest',
    FACEBOOK_REACTIONS = 'facebook_reactions', // not present in data
    LINKEDIN_COMMENTS = 'linkedin_comments',
    LINKEDIN_REACTIONS = 'linkedin_reactions',
}

export enum ShareSite {
    FACEBOOK = 'facebook',
    TWITTER = 'twitter',
    PINTEREST = 'pinterest',
    LINKEDIN = 'linkedin',
    ALL = 'all',
}

export interface IAnalyticsOptions {
    from?: Date
    to?: Date
    orderBy: ShareSite
}

export interface IAnalyticsResponse {
    id: number
    twitter: number
    facebook: number
    linkedin: number
    pinterest: number
    all: number
}

export interface IShareCountHistory {
    id: number
    articleId?: number
    count: number
    site: ShareSiteActions
    timestamp: string
}

export interface IShareCountHistoryList {
    rows: IShareCountHistory[]
}

export class AnalyticsQueryParams {
    @IsEnum(ShareSite)
    @IsOptional()
    orderBy?: ShareSite

    @IsDateString()
    @IsOptional()
    from?: string

    @IsDateString()
    @IsOptional()
    to?: string
}
