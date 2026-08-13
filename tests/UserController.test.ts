import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { UserController } from "../src/controllers/UserController";
import type { UserService } from "../src/services/UserService";

const createResponse = () => {
	const render = vi.fn();
	const response = {
		status: vi.fn(),
		render,
		redirect: vi.fn(),
	} as unknown as Response;
	vi.mocked(response.status).mockReturnValue(response);
	return { response, render };
};

const createRequest = () =>
	({
		body: { email: "candidate@example.com", password: "wrong-password" },
		session: {},
	}) as unknown as Request;

describe("UserController login errors", () => {
	it.each([400, 401])(
		"shows a user-friendly message when credentials receive status %i",
		async (status) => {
			const login = vi.fn().mockRejectedValue({
				isAxiosError: true,
				message: `Request failed with status code ${status}`,
				response: { status },
			});
			const controller = new UserController({
				login,
			} as unknown as UserService);
			const { response, render } = createResponse();

			await controller.login(createRequest(), response);

			expect(response.status).toHaveBeenCalledWith(status);
			expect(render).toHaveBeenCalledWith("login.njk", {
				errorMessage: "Email or password is incorrect",
				formValues: { email: "candidate@example.com" },
			});
		},
	);

	it("does not expose raw messages for other sign-in failures", async () => {
		const login = vi
			.fn()
			.mockRejectedValue(new Error("Request failed with status code 500"));
		const controller = new UserController({ login } as unknown as UserService);
		const { response, render } = createResponse();

		await controller.login(createRequest(), response);

		expect(response.status).toHaveBeenCalledWith(500);
		expect(render).toHaveBeenCalledWith("login.njk", {
			errorMessage: "Unable to sign in. Please try again later",
			formValues: { email: "candidate@example.com" },
		});
	});
});

describe("UserController registration", () => {
	it("registers the user, stores the token, and redirects home", async () => {
		const register = vi.fn().mockResolvedValue("registered-token");
		const controller = new UserController({
			register,
		} as unknown as UserService);
		const request = createRequest();
		const { response } = createResponse();

		await controller.register(request, response);

		expect(register).toHaveBeenCalledWith(
			"candidate@example.com",
			"wrong-password",
		);
		expect(request.session.jwtToken).toBe("registered-token");
		expect(request.session.registrationSuccessMessage).toBe(
			"Account successfully created.",
		);
		expect(response.redirect).toHaveBeenCalledWith("/");
	});

	it("shows a user-friendly message when the email is already registered", async () => {
		const register = vi.fn().mockRejectedValue({
			isAxiosError: true,
			response: { status: 409 },
		});
		const controller = new UserController({
			register,
		} as unknown as UserService);
		const { response, render } = createResponse();

		await controller.register(createRequest(), response);

		expect(response.status).toHaveBeenCalledWith(409);
		expect(render).toHaveBeenCalledWith("register.njk", {
			errorMessage: "Unable to register with these details",
			formValues: { email: "candidate@example.com" },
		});
	});
});
