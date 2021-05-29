import { InternalServerErrorException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../commons/db";
import { ArticleController } from "./article.controller";
import { ArticleService } from "./article.service";
import { AnalyticsQueryParams } from "./types";

describe("AppController", () => {
  let app: TestingModule;
  const OLD_ENV = process.env;

  beforeAll(async () => {
    process.env = { ...OLD_ENV }; // Make a copy
    process.env.DATABASE_CONNECTION_STRING =
      "postgres://postgres:mysecretpassword@localhost:5432/authory";

    const databaseService = new DatabaseService();
    const articleService = new ArticleService(databaseService);

    app = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: ArticleService.name,
          useFactory: () => articleService,
        },
      ],
    }).compile();
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it("fails to retrieve analytics when 'from' date is after 'to' date", () => {
    const appController = app.get<ArticleController>(ArticleController);
    const queryParams = new AnalyticsQueryParams();
    const fromDate = new Date();
    queryParams.from = fromDate.toISOString();
    const dateAtEpoch = new Date(0);
    queryParams.to = dateAtEpoch.toISOString();
    expect(appController.analytics(queryParams)).rejects.toThrowError(
      new InternalServerErrorException(
        ArticleService.FROM_DATE_GREATER_THAN_TO_DATE_ERROR_MESSAGE,
      ),
    );
  });

  it("retrieves the analytics successfully without 'to' date", async () => {
    const appController = app.get<ArticleController>(ArticleController);
    const queryParams = new AnalyticsQueryParams();
    const fromDate = new Date(0);
    queryParams.from = fromDate.toISOString();
    const analyticsDataRows = await appController.analytics(queryParams);
    expect(analyticsDataRows).toHaveLength(20);
  });

  it("retrieves the analytics successfully without 'from' date", async () => {
    const appController = app.get<ArticleController>(ArticleController);
    const queryParams = new AnalyticsQueryParams();
    const toDate = new Date();
    queryParams.to = toDate.toISOString();
    const analyticsDataRows = await appController.analytics(queryParams);
    expect(analyticsDataRows).toHaveLength(20);
  });

  it("retrieves the analytics successfully without 'to' or 'from' date", async () => {
    const expectedResponse: any = [
      {
        id: 177651,
        twitter: 0,
        pinterest: 56,
        linkedin: "0",
        facebook: "150090",
        all: "150146",
      },
      {
        id: 178112,
        twitter: 0,
        pinterest: 18,
        linkedin: "0",
        facebook: "8766",
        all: "8784",
      },
      {
        id: 186701,
        twitter: 45,
        pinterest: 6984,
        linkedin: "0",
        facebook: "1181",
        all: "8210",
      },
      {
        id: 2194576,
        twitter: 0,
        pinterest: 0,
        linkedin: "524",
        facebook: "44",
        all: "568",
      },
      {
        id: 2194584,
        twitter: 0,
        pinterest: 0,
        linkedin: "394",
        facebook: "28",
        all: "422",
      },
      {
        id: 2194557,
        twitter: 0,
        pinterest: 0,
        linkedin: "355",
        facebook: "0",
        all: "355",
      },
      {
        id: 2193738,
        twitter: 0,
        pinterest: 0,
        linkedin: "321",
        facebook: "15",
        all: "336",
      },
      {
        id: 2194551,
        twitter: 0,
        pinterest: 0,
        linkedin: "331",
        facebook: "0",
        all: "331",
      },
      {
        id: 2194582,
        twitter: 0,
        pinterest: 0,
        linkedin: "292",
        facebook: "0",
        all: "292",
      },
      {
        id: 2194542,
        twitter: 0,
        pinterest: 0,
        linkedin: "273",
        facebook: "4",
        all: "277",
      },
      {
        id: 2194566,
        twitter: 0,
        pinterest: 0,
        linkedin: "250",
        facebook: "0",
        all: "250",
      },
      {
        id: 2202371,
        twitter: 0,
        pinterest: 0,
        linkedin: "240",
        facebook: "0",
        all: "240",
      },
      {
        id: 2266432,
        twitter: 0,
        pinterest: 0,
        linkedin: "217",
        facebook: "0",
        all: "217",
      },
      {
        id: 2244088,
        twitter: 0,
        pinterest: 0,
        linkedin: "204",
        facebook: "0",
        all: "204",
      },
      {
        id: 2211124,
        twitter: 0,
        pinterest: 0,
        linkedin: "95",
        facebook: "0",
        all: "95",
      },
      {
        id: 2191230,
        twitter: 0,
        pinterest: 0,
        linkedin: "90",
        facebook: "0",
        all: "90",
      },
      {
        id: 2101618,
        twitter: 0,
        pinterest: 0,
        linkedin: "56",
        facebook: "0",
        all: "56",
      },
      {
        id: 2257507,
        twitter: 0,
        pinterest: 1,
        linkedin: "14",
        facebook: "1",
        all: "16",
      },
      {
        id: 2227264,
        twitter: 0,
        pinterest: 0,
        linkedin: "14",
        facebook: "0",
        all: "14",
      },
      {
        id: 2191227,
        twitter: 0,
        pinterest: 0,
        linkedin: "3",
        facebook: "0",
        all: "3",
      },
    ];
    const appController = app.get<ArticleController>(ArticleController);
    const queryParams = new AnalyticsQueryParams();
    const analyticsDataRows = await appController.analytics(queryParams);
    expect(analyticsDataRows).toHaveLength(20);
    expect(analyticsDataRows).toStrictEqual(expectedResponse);
  });

  it("retrieves the analytics successfully with 'to' and 'from' date", async () => {
    const appController = app.get<ArticleController>(ArticleController);
    const queryParams = new AnalyticsQueryParams();
    const fromDate = new Date(Date.parse("2011-10-05T14:48:00.000Z"));
    queryParams.from = fromDate.toISOString();
    const dateAtEpoch = new Date(Date.parse("2021-01-05T14:48:00.000Z"));
    queryParams.to = dateAtEpoch.toISOString();
    const analyticsDataRows = await appController.analytics(queryParams);
    expect(analyticsDataRows).toHaveLength(20);
  });
});
