import { Controller, Post, Body } from "@nestjs/common";
import { OpenaiService } from "./openai.service";

@Controller("generate-text")
export class OpenaiController {
    constructor(private readonly openAiService: OpenaiService) { }

    @Post()
    async generateText(@Body("prompt") prompt: string): Promise<{ text: string }> {
        if (!prompt) {
            throw new Error("Prompt is required.");
        }
        const text = await this.openAiService.generateText(prompt);
        return { text };
    } 
}
