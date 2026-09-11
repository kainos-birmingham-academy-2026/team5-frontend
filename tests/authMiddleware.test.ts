import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
	requireApplicant,
	requireAuthentication,
} from "../src/middleware/authMiddleware";

describe("requireAuthentication", () => {
	it("redirects a signed-out user to login", () => {
		const request = { session: {} } as unknown as Request;
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

describe("requireApplicant", () => {
	it("continues for an applicant", () => {
		const request = { session: { userRoleId: 1 } } as unknown as Request;
		const response = {} as Response;
		const next = vi.fn();

		requireApplicant(request, response, next);

		expect(next).toHaveBeenCalledOnce();
	});

	it("rejects a user who is not an applicant", () => {
		const request = { session: { userRoleId: 2 } } as unknown as Request;
		const response = {
			status: vi.fn().mockReturnThis(),
			send: vi.fn(),
		} as unknown as Response;
		const next = vi.fn();

		requireApplicant(request, response, next);

		expect(response.status).toHaveBeenCalledWith(403);
		expect(response.send).toHaveBeenCalledWith("Applicant access is required");
		expect(next).not.toHaveBeenCalled();
	});
});