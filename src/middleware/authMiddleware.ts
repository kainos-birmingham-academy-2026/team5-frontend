import type { NextFunction, Request, Response } from "express";

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