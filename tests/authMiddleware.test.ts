import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import {
	requireAdmin,
	requireAuthentication,
} from "../src/middleware/authMiddleware";

describe("requireAuthentication", () => {
	it("redirects a signed-out user to login and stores the original URL", () => {
		const request = {
			originalUrl: "/job-roles/new",
			session: {},
		} as unknown as Request & { session: { returnTo?: string } };
		const response = { redirect: vi.fn() } as unknown as Response;
		const next = vi.fn() as NextFunction;

		requireAuthentication(request, response, next);

		expect(request.session.returnTo).toBe("/job-roles/new");
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

describe("requireAdmin", () => {
	it("rejects a non-admin user with 403", () => {
		const request = { session: { userRoleId: 1 } } as unknown as Request;
		const response = { status: vi.fn(), send: vi.fn() } as unknown as Response;
		vi.mocked(response.status).mockReturnValue(response);
		const next = vi.fn() as NextFunction;

		requireAdmin(request, response, next);

		expect(response.status).toHaveBeenCalledWith(403);
		expect(response.send).toHaveBeenCalledWith("Forbidden");
		expect(next).not.toHaveBeenCalled();
	});

	it("allows an admin user to continue", () => {
		const request = { session: { userRoleId: 3 } } as unknown as Request;
		const response = {} as Response;
		const next = vi.fn() as NextFunction;

		requireAdmin(request, response, next);

		expect(next).toHaveBeenCalledOnce();
	});
});
