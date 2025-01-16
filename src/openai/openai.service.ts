import { Injectable, InternalServerErrorException, HttpException } from "@nestjs/common";
import { OpenAI } from "openai";

@Injectable()
export class OpenaiService {
    private openai: OpenAI;
    private readonly maxRetries = 3;
    private readonly retryDelay = 1000;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateText(prompt: string): Promise<string> {
        let retries = 0;
        while (retries <= this.maxRetries) {
            try {
                const response = await this.openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: prompt }],
                });

                return response.choices[0]?.message?.content || "No response generated";
            } catch (error) {
                if (error.response?.status === 429) {
                    const retryAfter = error.response.headers["retry-after"];
                    const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : this.retryDelay;
                    console.warn(`Rate limit reached. Retrying in ${waitTime / 1000} seconds...`);
                    await this.sleep(waitTime);
                } else if (error.response) {
                    console.error(
                        `OpenAI API Error: ${error.response.status} - ${error.response.data?.error?.message}`,
                    );
                    throw new HttpException(
                        `OpenAI API Error: ${error.response.data?.error?.message || "Unknown error"}`,
                        error.response.status,
                    );
                } else {
                    console.error("Unexpected error occurred:", error.message);
                    throw new InternalServerErrorException("Failed to generate text due to an unexpected error.");
                }
                retries++;
                if (retries > this.maxRetries) {
                    throw new InternalServerErrorException("Failed to generate text after multiple retry attempts.");
                }
            }
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
