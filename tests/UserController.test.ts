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
		clearCookie: vi.fn(),
	} as unknown as Response;
	vi.mocked(response.status).mockReturnValue(response);
	return { response, render };
};

type TestRequest = Omit<Request, "protocol"> & {
	protocol: string;
	session: {
		jwtToken?: string;
		userRoleId?: number;
		registrationSuccessMessage?: string;
		returnTo?: string;
	};
};

const createRequest = () =>
	({
		body: { email: "candidate@example.com", password: "wrong-password" },
		session: {},
		protocol: "http",
		get: ((name: string) =>
			name.toLowerCase() === "host" ? "localhost:4000" : undefined) as Request["get"],
	}) as unknown as TestRequest;

describe("UserController authentication pages", () => {
	it.each([
		["showLogin", "login.njk"],
		["showRegister", "register.njk"],
	] as const)("renders %s for a signed-out user", (method, template) => {
		const controller = new UserController({} as UserService);
		const request = createRequest();
		const { response, render } = createResponse();

		controller[method](request, response);

		expect(render).toHaveBeenCalledWith(template, {
			formValues: { email: "" },
		});
	});

	it.each(["showLogin", "showRegister"] as const)(
		"redirects %s home when the user is already signed in",
		(method) => {
			const controller = new UserController({} as UserService);
			const request = createRequest();
			request.session.jwtToken = "existing-token";
			const { response, render } = createResponse();

			controller[method](request, response);

			expect(response.redirect).toHaveBeenCalledWith("/");
			expect(render).not.toHaveBeenCalled();
		},
	);

	it.each(["showLogin", "showRegister"] as const)(
		"redirects %s to a safe returnTo when the user is already signed in",
		(method) => {
			const controller = new UserController({} as UserService);
			const request = createRequest();
			request.session.jwtToken = "existing-token";
			request.session.returnTo = "/job-roles/new";
			const { response, render } = createResponse();

			controller[method](request, response);

			expect(response.redirect).toHaveBeenCalledWith("/job-roles/new");
			expect(request.session.returnTo).toBeUndefined();
			expect(render).not.toHaveBeenCalled();
		},
	);
});

const applicantToken = `${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from('{"roleId":1}').toString("base64url")}.signature`;

describe("UserController login", () => {
	it("stores the token and applicant role before redirecting home", async () => {
		const login = vi.fn().mockResolvedValue(applicantToken);
		const controller = new UserController({ login } as unknown as UserService);
		const request = createRequest();
		const { response } = createResponse();

		await controller.login(request, response);

		expect(login).toHaveBeenCalledWith(
			"candidate@example.com",
			"wrong-password",
		);
		expect(request.session.jwtToken).toBeDefined();
		expect(request.session.userRoleId).toBe(1);
		expect(response.redirect).toHaveBeenCalledWith("/");
	});

	it("redirects to a stored returnTo after login and clears it", async () => {
		const login = vi.fn().mockResolvedValue(applicantToken);
		const controller = new UserController({ login } as unknown as UserService);
		const request = createRequest();
		request.session.returnTo = "/job-roles/new";
		const { response } = createResponse();

		await controller.login(request, response);

		expect(response.redirect).toHaveBeenCalledWith("/job-roles/new");
		expect(request.session.returnTo).toBeUndefined();
	});

	it("accepts a same-origin Azure URL and redirects to its path", async () => {
		const login = vi.fn().mockResolvedValue(applicantToken);
		const controller = new UserController({ login } as unknown as UserService);
		const request = createRequest();
		request.protocol = "https";
		request.get = ((name: string) =>
			name.toLowerCase() === "host"
				? "app.azurecontainerapps.io"
				: undefined) as Request["get"];
		request.session.returnTo =
			"https://app.azurecontainerapps.io/job-roles/new";
		const { response } = createResponse();

		await controller.login(request, response);

		expect(response.redirect).toHaveBeenCalledWith("/job-roles/new");
		expect(request.session.returnTo).toBeUndefined();
	});

	it.each(["https://evil.com", "//evil.com", "/\\", "/\\evil.com", "/\\\\evil.com"])(
		"ignores unsafe returnTo %s after login",
		async (returnTo) => {
			const login = vi.fn().mockResolvedValue(applicantToken);
			const controller = new UserController({ login } as unknown as UserService);
			const request = createRequest();
			request.session.returnTo = returnTo;
			const { response } = createResponse();

			await controller.login(request, response);

			expect(response.redirect).toHaveBeenCalledWith("/");
			expect(request.session.returnTo).toBeUndefined();
		},
	);

	it("renders a validation error when credentials are incomplete", async () => {
		const login = vi.fn();
		const controller = new UserController({ login } as unknown as UserService);
		const request = {
			body: { email: "  ", password: "" },
			session: {},
		} as unknown as Request;
		const { response, render } = createResponse();

		await controller.login(request, response);

		expect(login).not.toHaveBeenCalled();
		expect(response.status).toHaveBeenCalledWith(400);
		expect(render).toHaveBeenCalledWith("login.njk", {
			errorMessage: "Enter both email and password",
			formValues: { email: "" },
		});
	});
});

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
	it("registers the user, stores the applicant role, and redirects home", async () => {
		const register = vi
			.fn()
			.mockResolvedValue(
				`${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from('{"roleId":1}').toString("base64url")}.signature`,
			);
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
		expect(request.session.jwtToken).toBeDefined();
		expect(request.session.userRoleId).toBe(1);
		expect(request.session.registrationSuccessMessage).toBe(
			"Account successfully created.",
		);
		expect(response.redirect).toHaveBeenCalledWith("/");
	});

	it("redirects to a stored returnTo after registration and clears it", async () => {
		const register = vi.fn().mockResolvedValue(applicantToken);
		const controller = new UserController({
			register,
		} as unknown as UserService);
		const request = createRequest();
		request.session.returnTo = "/assistant";
		const { response } = createResponse();

		await controller.register(request, response);

		expect(response.redirect).toHaveBeenCalledWith("/assistant");
		expect(request.session.returnTo).toBeUndefined();
		expect(request.session.registrationSuccessMessage).toBe(
			"Account successfully created.",
		);
	});

	it.each(["https://evil.com", "//evil.com", "/\\", "/\\evil.com", "/\\\\evil.com"])(
		"ignores unsafe returnTo %s after registration",
		async (returnTo) => {
			const register = vi.fn().mockResolvedValue(applicantToken);
			const controller = new UserController({
				register,
			} as unknown as UserService);
			const request = createRequest();
			request.session.returnTo = returnTo;
			const { response } = createResponse();

			await controller.register(request, response);

			expect(response.redirect).toHaveBeenCalledWith("/");
			expect(request.session.returnTo).toBeUndefined();
		},
	);

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

	it("renders a validation error when registration details are incomplete", async () => {
		const register = vi.fn();
		const controller = new UserController({
			register,
		} as unknown as UserService);
		const request = {
			body: { email: "candidate@example.com" },
			session: {},
		} as unknown as Request;
		const { response, render } = createResponse();

		await controller.register(request, response);

		expect(register).not.toHaveBeenCalled();
		expect(response.status).toHaveBeenCalledWith(400);
		expect(render).toHaveBeenCalledWith("register.njk", {
			errorMessage: "Enter both email and password",
			formValues: { email: "candidate@example.com" },
		});
	});

	it("shows a generic message for unexpected registration failures", async () => {
		const register = vi.fn().mockRejectedValue(new Error("API unavailable"));
		const controller = new UserController({
			register,
		} as unknown as UserService);
		const { response, render } = createResponse();

		await controller.register(createRequest(), response);

		expect(response.status).toHaveBeenCalledWith(500);
		expect(render).toHaveBeenCalledWith("register.njk", {
			errorMessage: "Unable to register. Please try again later",
			formValues: { email: "candidate@example.com" },
		});
	});
});

describe("UserController logout", () => {
	it("destroys the session, clears its cookie, and redirects home", () => {
		const destroy = vi.fn((callback: (error?: unknown) => void) => callback());
		const request = { session: { destroy } } as unknown as Request;
		const controller = new UserController({} as UserService);
		const { response } = createResponse();

		controller.logout(request, response);

		expect(destroy).toHaveBeenCalledOnce();
		expect(response.clearCookie).toHaveBeenCalledWith("connect.sid");
		expect(response.redirect).toHaveBeenCalledWith("/");
	});
});
