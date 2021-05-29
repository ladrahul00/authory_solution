import { Resource } from "../commons/types";
import { IAnalyticsResponse, ShareSite } from "./types";
import { InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "src/commons/db";

export class ArticleService extends Resource {
  public static readonly FROM_DATE_GREATER_THAN_TO_DATE_ERROR_MESSAGE =
    "from date cannot be greater than to date";

  private readonly databaseService: DatabaseService;

  constructor(databaseService_: DatabaseService) {
    super();
    this.databaseService = databaseService_;
  }

  public async analytics(
    fromDateTime?: string,
    orderBy?: ShareSite,
    toDateTime?: string,
  ): Promise<IAnalyticsResponse[]> {
    const queryString = ArticleService.generateQueryString(
      fromDateTime,
      toDateTime,
      orderBy,
    );
    const toValueQueryResult = await this.databaseService.executeQuery(
      queryString,
    );
    const analyticsResp = toValueQueryResult.rows as IAnalyticsResponse[];
    return analyticsResp;
  }

  private static getFromDate(from?: string): Date | undefined {
    if (!from) return;
    const fromDate = new Date(Date.parse(from));
    const minDateThreshold = new Date(0);
    if (minDateThreshold < fromDate) return fromDate;
    return;
  }
  private static getToDate(to?: string): Date | undefined {
    if (!to) return;
    const toDate = new Date(Date.parse(to));
    const maxDateThreshold = new Date();
    if (maxDateThreshold > toDate) return toDate;
    return;
  }

  private static generateQueryString(
    fromDateString?: string,
    toDateString?: string,
    orderBy: ShareSite = ShareSite.ALL,
  ) {
    let aboveQuery: string;
    let belowQuery: string;
    const fromDate = ArticleService.getFromDate(fromDateString);
    const toDate = ArticleService.getToDate(toDateString);
    if (fromDate && toDate && fromDate > toDate) {
      throw new InternalServerErrorException(
        ArticleService.FROM_DATE_GREATER_THAN_TO_DATE_ERROR_MESSAGE,
      );
    }
    if (fromDate) {
      const fromEpoch =
        (fromDate.getTime() - fromDate.getMilliseconds()) / 1000;
      belowQuery = `WINDOW_BELOW AS (
                SELECT DISTINCT ON ("articleId", "site")
                LAST_VALUE("id") OVER wnd AS below
                FROM "ShareCountHistory"
                WHERE
                    "timestamp" BETWEEN to_timestamp(0)  AND to_timestamp(${fromEpoch}) -- from
                WINDOW wnd AS (
                    PARTITION BY "articleId", "site" ORDER BY "timestamp"
                    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                )
            ),`;
    } else {
      belowQuery = `WINDOW_BELOW AS (
                SELECT DISTINCT ON ("articleId", "site")
                LAST_VALUE("id") OVER wnd AS below
                FROM "ShareCountHistory"
                WHERE
                    "timestamp" < to_timestamp(0) -- from
                WINDOW wnd AS (
                    PARTITION BY "articleId", "site" ORDER BY "timestamp"
                    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                )
            ),`;
    }
    if (toDate) {
      const toEpoch = (toDate.getTime() - toDate.getMilliseconds()) / 1000;
      aboveQuery = `WINDOW_ABOVE AS (
                SELECT DISTINCT ON ("articleId", "site")
                FIRST_VALUE("id") OVER wnd AS above
                FROM "ShareCountHistory"
                WHERE
                    "timestamp" BETWEEN to_timestamp(${toEpoch}) AND now()  -- to
                WINDOW wnd AS (
                    PARTITION BY "articleId", "site" ORDER BY "timestamp"
                    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                )
            ),`;
    } else {
      aboveQuery = `WINDOW_ABOVE AS (
                SELECT DISTINCT ON ("articleId", "site")
                LAST_VALUE("id") OVER wnd AS above
                FROM "ShareCountHistory"
                WHERE
                    "timestamp" < now()  -- to
                WINDOW wnd AS (
                    PARTITION BY "articleId", "site" ORDER BY "timestamp"
                    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                )
            ),`;
    }
    return `
            WITH
                ${belowQuery}
                ${aboveQuery}
                LAST_VALUES AS (
                    SELECT "count", "site", "articleId"
                    FROM "ShareCountHistory"
                    WHERE "id" IN (SELECT "above" FROM WINDOW_ABOVE)
                ),
                FIRST_VALUES AS (
                    SELECT "count", "site", "articleId"
                    FROM "ShareCountHistory"
                    WHERE "id" IN (SELECT "below" FROM WINDOW_BELOW)
                ),
                ALL_ARTICLE_IDS AS (
                    SELECT "articleId" FROM "ShareCountHistory" GROUP BY "articleId"
                ),
                TWITTER_FINAL_VALUES AS (
                    SELECT lv."count" - coalesce(fv."count", 0) as diff, lv."articleId", lv."site"
                    FROM LAST_VALUES as lv
                    LEFT JOIN FIRST_VALUES fv ON fv."articleId" = lv."articleId" AND fv."site" = lv."site"
                    WHERE lv."site" = 'twitter'
                ),
                PINTEREST_FINAL_VALUES AS (
                    SELECT lv."count" - coalesce(fv."count", 0) as diff, lv."articleId", lv."site"
                    FROM LAST_VALUES as lv
                    LEFT JOIN FIRST_VALUES fv ON fv."articleId" = lv."articleId" AND fv."site" = lv."site"
                    WHERE lv."site" = 'pinterest'
                ),
                LINKEDIN_FIRST_VALUES AS (
                    SELECT SUM(fv."count") AS "count", fv."articleId", 'linkedin' AS site
                    FROM FIRST_VALUES fv
                    WHERE fv."site" IN ('linkedin_reactions', 'linkedin_comments')
                    GROUP BY fv."articleId"
                ),
                LINKEDIN_LAST_VALUES AS (
                    SELECT SUM(lv."count") AS "count", lv."articleId", 'linkedin' AS site
                    FROM LAST_VALUES lv
                    WHERE lv."site" IN ('linkedin_reactions', 'linkedin_comments')
                    GROUP BY lv."articleId"
                ),
                LINKEDIN_FINAL_VALUES AS (
                    SELECT lv."count" - coalesce(fv."count", 0) as diff, lv."articleId", lv."site"
                    FROM LINKEDIN_LAST_VALUES as lv
                    LEFT JOIN LINKEDIN_FIRST_VALUES fv ON fv."articleId" = lv."articleId"
                ),
                FACEBOOK_FIRST_VALUES AS (
                    SELECT SUM(fv."count") AS "count", fv."articleId", 'facebook' AS site
                    FROM FIRST_VALUES fv
                    WHERE fv."site" IN ('facebook_reactions', 'facebook')
                    GROUP BY fv."articleId"
                ),
                FACEBOOK_LAST_VALUES AS (
                    SELECT SUM(lv."count") AS "count", lv."articleId", 'facebook' AS site
                    FROM LAST_VALUES lv
                    WHERE lv."site" IN ('facebook_reactions', 'facebook')
                    GROUP BY lv."articleId"
                ),
                FACEBOOK_FINAL_VALUES AS (
                    SELECT lv."count" - coalesce(fv."count", 0) as diff, lv."articleId", lv."site"
                    FROM FACEBOOK_LAST_VALUES as lv
                    LEFT JOIN FACEBOOK_FIRST_VALUES fv ON fv."articleId" = lv."articleId" AND fv."site" = lv."site"
                    WHERE lv."site" = 'facebook'
                )
                SELECT
                    all_articles."articleId" AS "id",
                    coalesce(tw."diff", 0) AS "twitter",
                    coalesce(pint.diff, 0) AS "pinterest",
                    coalesce(lkdin.diff, 0) AS "linkedin",
                    coalesce(fb.diff, 0) AS "facebook",
                    (
                        coalesce(tw."diff", 0) +
                        coalesce(pint.diff, 0) +
                        coalesce(lkdin.diff, 0) +
                        coalesce(fb.diff, 0)) AS "all"
                from
                ALL_ARTICLE_IDS AS all_articles
                LEFT JOIN TWITTER_FINAL_VALUES AS tw ON all_articles."articleId" = tw."articleId"
                LEFT JOIN PINTEREST_FINAL_VALUES AS pint ON  all_articles."articleId" = pint."articleId"
                LEFT JOIN LINKEDIN_FINAL_VALUES AS lkdin ON all_articles."articleId" = lkdin."articleId"
                LEFT JOIN FACEBOOK_FINAL_VALUES AS fb ON all_articles."articleId" = fb."articleId"
                ORDER BY "${orderBy}" DESC`;
  }
}
