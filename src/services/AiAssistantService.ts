import axios from "axios";
import apiClient from "../config/apiClient";

// Claude responses regularly exceed the shared api client timeout.
const ASSISTANT_TIMEOUT_MS = 30_000;

export const MAX_QUESTION_LENGTH = 1000;

export type AiAssistantAnswer = {
	answer: string;
};

export class AiAssistantError extends Error {
	constructor(
		message: string,
		readonly statusCode: number,
	) {
		super(message);
		this.name = "AiAssistantError";
	}
}

const messageForStatus = (status: number): AiAssistantError => {
	switch (status) {
		case 400:
			return new AiAssistantError(
				`Your question must be between 1 and ${MAX_QUESTION_LENGTH} characters.`,
				400,
			);
		case 429:
			return new AiAssistantError(
				"That is a lot of questions at once. Please wait a moment and try again.",
				429,
			);
		case 503:
			return new AiAssistantError(
				"The careers assistant is not available at the moment.",
				503,
			);
		default:
			return new AiAssistantError(
				"The careers assistant is temporarily unavailable. Please try again shortly.",
				502,
			);
	}
};

export class AiAssistantService {
	async ask(question: string): Promise<string> {
		try {
			const response = await apiClient.post<AiAssistantAnswer>(
				"/assistant/questions",
				{ question },
				{ timeout: ASSISTANT_TIMEOUT_MS },
			);

			return response.data.answer;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				throw messageForStatus(error.response.status);
			}

			throw messageForStatus(502);
		}
	}
}
