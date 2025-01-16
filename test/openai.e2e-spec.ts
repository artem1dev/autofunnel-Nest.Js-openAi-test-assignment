import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { OpenaiController } from "../src/openai/openai.controller";
import { OpenaiService } from "../src/openai/openai.service";
import { ThrottlerModule } from "@nestjs/throttler";

jest.mock("../src/openai/openai.service");

describe("OpenAI (e2e)", () => {
    let app: INestApplication;
    let openaiService: OpenaiService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ThrottlerModule.forRoot([
                    {
                        ttl: 60000,
                        limit: 5,
                    },
                ]),
            ],
            controllers: [OpenaiController],
            providers: [
                {
                    provide: OpenaiService,
                    useValue: {
                        generateText: jest.fn().mockResolvedValue("Mocked response"),
                    },
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        openaiService = moduleFixture.get<OpenaiService>(OpenaiService);
        await app.init();
    });

    it("/generate-text (POST)", async () => {
        const prompt = "Test E2E prompt";
        const response = await request(app.getHttpServer()).post("/generate-text").send({ prompt }).expect(201);
        expect(response.body).toHaveProperty("text");
        expect(response.body.text).toBe("Mocked response");
    });

    it("/generate-text (POST) should handle rate limits", async () => {
        const prompt = "Test rate-limiting";
        const maxRequests = 4;
        for (let i = 0; i < maxRequests; i++) {
            const response = await request(app.getHttpServer()).post("/generate-text").send({ prompt }).expect(201);
            expect(response.body).toHaveProperty("text");
            expect(response.body.text).toBe("Mocked response");
        }

        const rateLimitedResponse = await request(app.getHttpServer())
            .post("/generate-text")
            .send({ prompt })
            .expect(429);
        expect(rateLimitedResponse.body).toHaveProperty("statusCode", 429);
        expect(rateLimitedResponse.body).toHaveProperty(
            "message",
            "You have exceeded the maximum number of requests. Please try again later.",
        );
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });
});
