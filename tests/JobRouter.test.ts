import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { APPLICANT_ROLE_ID } from "../src/lib/jwt";
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
		process.env.NODE_ENV = "test";
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