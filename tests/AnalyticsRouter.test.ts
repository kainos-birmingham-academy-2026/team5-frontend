import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_ROLE_ID, APPLICANT_ROLE_ID } from "../src/lib/jwt";

const controllerMock = vi.hoisted(() => ({
	getDashboard: vi.fn((_req, res) => res.status(200).send("dashboard")),
}));

vi.mock("../src/controllers/AnalyticsController", () => ({
	AnalyticsController: vi.fn(function AnalyticsControllerMock() {
		return controllerMock;
	}),
}));

import AnalyticsRouter from "../src/routes/AnalyticsRouter";

type SessionState = { jwtToken?: string; userRoleId?: number };

const createApp = (sessionState: SessionState) => {
	const app = express();
	app.use((req, _res, next) => {
		req.session = { ...sessionState } as typeof req.session;
		next();
	});
	app.use(AnalyticsRouter);
	return app;
};

describe("AnalyticsRouter", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("redirects a signed-out visitor to the login page", async () => {
		const response = await request(createApp({})).get("/admin/analytics");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
		expect(controllerMock.getDashboard).not.toHaveBeenCalled();
	});

	it("forbids an applicant", async () => {
		const response = await request(
			createApp({ jwtToken: "token", userRoleId: APPLICANT_ROLE_ID }),
		).get("/admin/analytics");

		expect(response.status).toBe(403);
		expect(response.text).toBe("Forbidden");
		expect(controllerMock.getDashboard).not.toHaveBeenCalled();
	});

	it("renders the dashboard for an admin", async () => {
		const response = await request(
			createApp({ jwtToken: "token", userRoleId: ADMIN_ROLE_ID }),
		).get("/admin/analytics");

		expect(response.status).toBe(200);
		expect(controllerMock.getDashboard).toHaveBeenCalledTimes(1);
	});

	it("passes the query string through to the controller", async () => {
		await request(createApp({ jwtToken: "token", userRoleId: ADMIN_ROLE_ID }))
			.get("/admin/analytics")
			.query({ preset: "7d", sortBy: "roleName" });

		expect(controllerMock.getDashboard).toHaveBeenCalledWith(
			expect.objectContaining({
				query: expect.objectContaining({ preset: "7d", sortBy: "roleName" }),
			}),
			expect.anything(),
		);
	});
});
