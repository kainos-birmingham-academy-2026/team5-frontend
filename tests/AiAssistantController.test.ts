import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { AiAssistantController } from "../src/controllers/AiAssistantController";
import {
	AiAssistantError,
	type AiAssistantService,
} from "../src/services/AiAssistantService";

const createResponse = () => {
	const response = {
		status: vi.fn(),
		json: vi.fn(),
		render: vi.fn(),
	} as unknown as Response;
	vi.mocked(response.status).mockReturnValue(response);
	return response;
};

describe("AiAssistantController", () => {
	it("renders the assistant page", () => {
		const controller = new AiAssistantController({} as AiAssistantService);
		const request = {
			session: { jwtToken: "session-token" },
		} as unknown as Request;
		const response = createResponse();

		controller.showAssistant(request, response);

		expect(response.render).toHaveBeenCalledWith("assistant.njk", {
			maxQuestionLength: 1000,
		});
	});

	it("forwards the session token when asking a question", async () => {
		const ask = vi.fn().mockResolvedValue("Apply on the site.");
		const controller = new AiAssistantController({
			ask,
		} as unknown as AiAssistantService);
		const request = {
			body: { question: "How do I apply?" },
			session: { jwtToken: "session-token" },
		} as unknown as Request;
		const response = createResponse();

		await controller.ask(request, response);

		expect(ask).toHaveBeenCalledWith("How do I apply?", "session-token");
		expect(response.status).toHaveBeenCalledWith(200);
		expect(response.json).toHaveBeenCalledWith({
			answer: "Apply on the site.",
		});
	});

	it("rejects an empty question without calling the service", async () => {
		const ask = vi.fn();
		const controller = new AiAssistantController({
			ask,
		} as unknown as AiAssistantService);
		const request = {
			body: { question: "   " },
			session: { jwtToken: "session-token" },
		} as unknown as Request;
		const response = createResponse();

		await controller.ask(request, response);

		expect(ask).not.toHaveBeenCalled();
		expect(response.status).toHaveBeenCalledWith(400);
		expect(response.json).toHaveBeenCalledWith({
			error: "Your question must be between 1 and 1000 characters.",
		});
	});

	it("returns the assistant error status when the service fails", async () => {
		const ask = vi
			.fn()
			.mockRejectedValue(new AiAssistantError("Please wait a moment.", 429));
		const controller = new AiAssistantController({
			ask,
		} as unknown as AiAssistantService);
		const request = {
			body: { question: "How do I apply?" },
			session: { jwtToken: "session-token" },
		} as unknown as Request;
		const response = createResponse();

		await controller.ask(request, response);

		expect(response.status).toHaveBeenCalledWith(429);
		expect(response.json).toHaveBeenCalledWith({
			error: "Please wait a moment.",
		});
	});
});
