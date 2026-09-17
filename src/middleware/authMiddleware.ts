import type { NextFunction, Request, Response } from "express";
import { APPLICANT_ROLE_ID } from "../lib/jwt";

export function requireAuthentication(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (!req.session.jwtToken) {
		res.redirect("/login");
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
