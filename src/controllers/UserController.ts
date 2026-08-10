import type { Request, Response } from "express";
import type { UserService } from "../services/UserService";

export class UserController {
	constructor(private userService: UserService) {}

	showLogin(_req: Request, res: Response): void {
		res.render("login.njk", {
			formValues: { email: "" },
		});
	}

	async login(req: Request, res: Response): Promise<void> {
		const email = String(req.body.email ?? "").trim();
		const password = String(req.body.password ?? "");

		if (!email || !password) {
			res.status(400).json({ error: "Enter both email and password" });
			return;
		}

		try {
			const jwtToken = await this.userService.login(email, password);
			req.session.jwtToken = jwtToken;
			res.status(200).json({ token: jwtToken });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to sign in";
			res.status(401).json({ error: message });
		}
	}
}
