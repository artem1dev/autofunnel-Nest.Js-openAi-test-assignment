import { Test, TestingModule } from "@nestjs/testing";
import { OpenaiService } from "./openai.service";
import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { OpenAI } from "openai";

jest.mock("openai");

describe("OpenaiService", () => {
    let service: OpenaiService;
    let mockOpenAI: jest.Mocked<OpenAI>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [OpenaiService],
        }).compile();
        service = module.get<OpenaiService>(OpenaiService);
        mockOpenAI = OpenAI.prototype as jest.Mocked<OpenAI>;
        mockOpenAI.chat = {
            completions: {
                create: jest.fn(),
            },
        } as any;
    });

    it("should return text from OpenAI", async () => {
        const prompt = "Hello, world!";
        const mockResponse = {
            choices: [
                {
                    message: { content: "Generated response" },
                },
            ],
        };
        (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);
        const result = await service.generateText(prompt);
        expect(result).toBe("Generated response");
        expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });
    });

    it("should retry on rate-limiting errors (429) and eventually succeed", async () => {
        const prompt = "Retry test";
        const mockResponse = {
            choices: [{ message: { content: "Generated response" } }],
        };

        (mockOpenAI.chat.completions.create as jest.Mock)
            .mockRejectedValueOnce({ response: { status: 429, headers: { "retry-after": "1" } } }) // Rate-limit error
            .mockResolvedValueOnce(mockResponse as any); // Success on retry

        const result = await service.generateText(prompt);
        expect(result).toBe("Generated response");
        expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
    });

    it("should throw an HttpException on non-rate-limit API errors", async () => {
        const prompt = "Error test";
        const apiError = {
            response: { status: 500, data: { error: { message: "Internal Server Error" } } },
        };

        (mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValue(apiError);

        await expect(service.generateText(prompt)).rejects.toThrow(HttpException);
    });

    it("should throw an InternalServerErrorException on failure", async () => {
        const prompt = "Hello, world!";
        (mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValue(new Error("API Error"));
        await expect(service.generateText(prompt)).rejects.toThrow(InternalServerErrorException);
    });
});
