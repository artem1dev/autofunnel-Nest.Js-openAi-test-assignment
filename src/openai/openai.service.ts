import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { OpenAI } from "openai";

@Injectable()
export class OpenaiService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        }); 
    }

    async generateText(prompt: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
            });

            return response.choices[0]?.message?.content || "No response generated";
        } catch (error) {
            console.error("Error generating text:", error);
            throw new InternalServerErrorException("Failed to generate text");
        }
    }
}
