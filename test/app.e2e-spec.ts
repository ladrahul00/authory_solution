import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { forwardRef, INestApplication, ValidationPipe } from "@nestjs/common";
import { Main } from "../src/appMain";

describe("Application (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    await Main.initialize();

    const moduleFixture = await Test.createTestingModule({
      imports: [forwardRef(() => AppModule)],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it("verifies if the ping request is executed successfully", () => {
    return request(app.getHttpServer())
      .get("/ping")
      .expect(200)
      .expect("Hello World!");
  });

  it("verifies if analytics request without parameters is executed successfully", () => {
    return request(app.getHttpServer()).get("/analytics").expect(200);
  });

  it('verifies if analytics request with "orderBy" parameter is executed successfully', () => {
    return request(app.getHttpServer())
      .get("/analytics?orderBy=twitter")
      .expect(200);
  });

  it("fails if analytics request has invalid values for order by parameter", () => {
    return request(app.getHttpServer())
      .get("/analytics?orderBy=invalid")
      .expect(400);
  });

  it('verifies if analytics request with "to" date parameter is executed successfully', () => {
    return request(app.getHttpServer())
      .get("/analytics?to=2020-10-05T14:48:00.000Z")
      .expect(200);
  });

  it('fails if analytics request has invalid date format for "to" date parameter', () => {
    return request(app.getHttpServer())
      .get("/analytics?to=invalid")
      .expect(400);
  });

  it('verifies if analytics request with "from" date parameter is executed successfully', () => {
    return request(app.getHttpServer())
      .get("/analytics?from=2019-10-05T14:48:00.000Z")
      .expect(200);
  });

  it('fails if analytics request has invalid date format for "from" date parameter', () => {
    return request(app.getHttpServer())
      .get("/analytics?from=invalid")
      .expect(400);
  });
});
