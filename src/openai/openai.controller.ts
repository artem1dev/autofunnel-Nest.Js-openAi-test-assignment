import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { OpenaiService } from "./openai.service";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";

@Controller()
export class OpenaiController {
    constructor(private readonly openAiService: OpenaiService) {}

    @Post("generate-text")
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async generateText(@Body("prompt") prompt: string): Promise<{ text: string }> {
        if (!prompt) {
            throw new Error("Prompt is required.");
        }
        const text = await this.openAiService.generateText(prompt);
        return { text };
    }
}
