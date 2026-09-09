import type { Request, Response } from "express";
import {
	AiAssistantError,
	type AiAssistantService,
	MAX_QUESTION_LENGTH,
} from "../services/AiAssistantService";

export class AiAssistantController {
	constructor(private aiAssistantService: AiAssistantService) {}

	showAssistant(_req: Request, res: Response): void {
		res.render("assistant.njk", { maxQuestionLength: MAX_QUESTION_LENGTH });
	}

	async ask(req: Request, res: Response): Promise<void> {
		const rawQuestion = req.body?.question;
		const question = typeof rawQuestion === "string" ? rawQuestion.trim() : "";

		if (!question || question.length > MAX_QUESTION_LENGTH) {
			res.status(400).json({
				error: `Your question must be between 1 and ${MAX_QUESTION_LENGTH} characters.`,
			});
			return;
		}

		try {
			const answer = await this.aiAssistantService.ask(question);
			res.status(200).json({ answer });
		} catch (error) {
			if (error instanceof AiAssistantError) {
				res.status(error.statusCode).json({ error: error.message });
				return;
			}

			console.error("Failed to reach the AI assistant:", error);
			res.status(502).json({
				error:
					"The careers assistant is temporarily unavailable. Please try again shortly.",
			});
		}
	}
}
