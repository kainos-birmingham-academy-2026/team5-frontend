import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { APPLICANT_ROLE_ID } from "../src/lib/jwt";

const controllerMock = vi.hoisted(() => ({
	getAllJobRoles: vi.fn(),
	getApplicationForm: vi.fn(),
	getHomePage: vi.fn(),
	getJobRoleInformation: vi.fn(),
	submitApplication: vi.fn((_req, res) => res.status(204).end()),
}));

vi.mock("../src/controllers/JobRoleController", () => ({
	JobRoleController: vi.fn(function JobRoleControllerMock() {
		return controllerMock;
	}),
}));

import JobRouter from "../src/routes/JobRouter";

describe("JobRouter CV upload validation", () => {
	const createApp = () => {
		const app = express();
		app.use((req, _res, next) => {
			req.session = {
				jwtToken: "session-token",
				userRoleId: APPLICANT_ROLE_ID,
			} as typeof req.session;
			next();
		});
		app.use(JobRouter);
		return app;
	};

	beforeEach(() => {
		vi.clearAllMocks();
		process.env.NODE_ENV = "test";
	});

	it("forwards a valid PDF CV to the application controller", async () => {
		const cvData = Buffer.from("pdf-content");

		const response = await request(createApp())
			.post("/job-roles/12/apply")
			.attach("cv", cvData, {
				filename: "cv.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).toBe(204);
		expect(controllerMock.submitApplication).toHaveBeenCalledWith(
			expect.objectContaining({
				file: expect.objectContaining({
					buffer: cvData,
					mimetype: "application/pdf",
					originalname: "cv.pdf",
				}),
			}),
			expect.anything(),
		);
	});

	it("redirects a disallowed CV type to the application form", async () => {
		const response = await request(createApp())
			.post("/job-roles/12/apply")
			.attach("cv", Buffer.from("not a document"), {
				filename: "cv.txt",
				contentType: "text/plain",
			});

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles/12/apply");
	});

	it("redirects an oversized CV to the application form", async () => {
		const response = await request(createApp())
			.post("/job-roles/12/apply")
			.attach("cv", Buffer.alloc(5 * 1024 * 1024 + 1), {
				filename: "cv.pdf",
				contentType: "application/pdf",
			});

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-roles/12/apply");
	});
});