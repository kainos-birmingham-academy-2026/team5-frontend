import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const apiClientMock = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock("../src/config/apiClient", () => ({ default: apiClientMock }));

import { UserService } from "../src/services/UserService";

describe("UserService", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		delete process.env.AUTH_LOGIN_PATH;
		delete process.env.AUTH_REGISTER_PATH;
	});

	afterEach(() => {
		delete process.env.AUTH_LOGIN_PATH;
		delete process.env.AUTH_REGISTER_PATH;
	});

	it("logs in through the default endpoint and returns the token", async () => {
		apiClientMock.post.mockResolvedValue({ data: { token: "login-token" } });

		const result = await new UserService().login(
			"candidate@example.com",
			"password",
		);

		expect(apiClientMock.post).toHaveBeenCalledWith("/auth/login", {
			email: "candidate@example.com",
			password: "password",
		});
		expect(result).toBe("login-token");
	});

	it("uses the configured login endpoint", async () => {
		process.env.AUTH_LOGIN_PATH = "/custom/login";
		apiClientMock.post.mockResolvedValue({ data: { token: "login-token" } });

		await new UserService().login("candidate@example.com", "password");

		expect(apiClientMock.post).toHaveBeenCalledWith(
			"/custom/login",
			expect.any(Object),
		);
	});

	it("registers through the default endpoint and returns the token", async () => {
		apiClientMock.post.mockResolvedValue({ data: { token: "register-token" } });

		const result = await new UserService().register(
			"candidate@example.com",
			"password",
		);

		expect(apiClientMock.post).toHaveBeenCalledWith("/auth/register", {
			email: "candidate@example.com",
			password: "password",
		});
		expect(result).toBe("register-token");
	});

	it("uses the configured registration endpoint", async () => {
		process.env.AUTH_REGISTER_PATH = "/custom/register";
		apiClientMock.post.mockResolvedValue({ data: { token: "register-token" } });

		await new UserService().register("candidate@example.com", "password");

		expect(apiClientMock.post).toHaveBeenCalledWith(
			"/custom/register",
			expect.any(Object),
		);
	});
});
