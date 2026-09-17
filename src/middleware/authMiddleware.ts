import type { NextFunction, Request, Response } from "express";
import { ADMIN_ROLE_ID, APPLICANT_ROLE_ID } from "../lib/jwt";

export function requireAuthentication(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (!req.session.jwtToken) {
		req.session.returnTo = req.originalUrl;
		res.redirect("/login");
		return;
	}

	next();
}

export function requireAdmin(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (req.session.userRoleId !== ADMIN_ROLE_ID) {
		res.status(403).send("Forbidden");
		return;
	}

	next();
}

export function requireApplicant(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (req.session.userRoleId !== APPLICANT_ROLE_ID) {
		res.status(403).send("Applicant access is required");
		return;
	}

	next();
}
