import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { OpenaiService } from "./openai.service";
import { Throttle } from "@nestjs/throttler";
import { CustomThrottlerGuard } from "./customThrottlerGuard";

@Controller()
export class OpenaiController {
    constructor(private readonly openAiService: OpenaiService) {}

    @Post("generate-text")
    @UseGuards(CustomThrottlerGuard)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async generateText(@Body("prompt") prompt: string): Promise<{ text: string }> {
        if (!prompt) {
            throw new Error("Prompt is required.");
        }
        const text = await this.openAiService.generateText(prompt);
        return { text };
    }
}
