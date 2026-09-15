import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const apiClientMock = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("../src/config/apiClient", () => ({ default: apiClientMock }));

import {
	AiAssistantError,
	AiAssistantService,
} from "../src/services/AiAssistantService";

describe("AiAssistantService", () => {
	beforeEach(() => vi.resetAllMocks());

	it("sends the question with the session authorization header", async () => {
		apiClientMock.post.mockResolvedValue({
			data: { answer: "Apply on the site." },
		});

		const result = await new AiAssistantService().ask(
			"How do I apply?",
			"session-token",
		);

		expect(apiClientMock.post).toHaveBeenCalledWith(
			"/assistant/questions",
			{ question: "How do I apply?" },
			{
				timeout: 30_000,
				headers: { Authorization: "Bearer session-token" },
			},
		);
		expect(result).toBe("Apply on the site.");
	});

	it("omits the authorization header when no token is provided", async () => {
		apiClientMock.post.mockResolvedValue({ data: { answer: "Hello." } });

		await new AiAssistantService().ask("Hello?");

		expect(apiClientMock.post).toHaveBeenCalledWith(
			"/assistant/questions",
			{ question: "Hello?" },
			{
				timeout: 30_000,
				headers: undefined,
			},
		);
	});

	it("maps a 429 response to a rate-limit error", async () => {
		apiClientMock.post.mockRejectedValue({
			isAxiosError: true,
			response: { status: 429 },
		});
		vi.spyOn(axios, "isAxiosError").mockReturnValue(true);

		await expect(
			new AiAssistantService().ask("Hello?", "session-token"),
		).rejects.toEqual(
			expect.objectContaining({
				name: "AiAssistantError",
				statusCode: 429,
			} satisfies Partial<AiAssistantError>),
		);
	});
});
