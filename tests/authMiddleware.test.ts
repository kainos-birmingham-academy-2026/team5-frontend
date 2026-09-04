import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { requireAuthentication } from "../src/middleware/authMiddleware";

describe("requireAuthentication", () => {
	it("redirects a signed-out user to login", () => {
		const request = { session: {} } as Request;
		const response = { redirect: vi.fn() } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireAuthentication(request, response, next);

		expect(response.redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("allows a signed-in user to continue", () => {
		const request = {
			session: { jwtToken: "session-token" },
		} as unknown as Request;
		const response = { redirect: vi.fn() } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireAuthentication(request, response, next);

		expect(next).toHaveBeenCalledOnce();
		expect(response.redirect).not.toHaveBeenCalled();
	});
});