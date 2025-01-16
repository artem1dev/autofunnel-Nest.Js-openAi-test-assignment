import { Test, TestingModule } from "@nestjs/testing";
import { OpenaiService } from "./openai.service";
import { InternalServerErrorException } from "@nestjs/common";
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

    it("should throw an InternalServerErrorException on failure", async () => {
        const prompt = "Hello, world!";
        (mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValue(new Error("API Error"));
        await expect(service.generateText(prompt)).rejects.toThrow(InternalServerErrorException);
    });
});
