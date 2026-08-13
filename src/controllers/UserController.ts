import axios from "axios";
import type { Request, Response } from "express";
import type { UserService } from "../services/UserService";

export class UserController {
	constructor(private userService: UserService) {}

	showLogin(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/");
			return;
		}

		res.render("login.njk", {
			formValues: { email: "" },
		});
	}

	showRegister(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/");
			return;
		}

		res.render("register.njk", {
			formValues: { email: "" },
		});
	}

	async login(req: Request, res: Response): Promise<void> {
		const email = String(req.body.email ?? "").trim();
		const password = String(req.body.password ?? "");

		if (!email || !password) {
			res.status(400).render("login.njk", {
				errorMessage: "Enter both email and password",
				formValues: { email },
			});
			return;
		}

		try {
			const jwtToken = await this.userService.login(email, password);
			req.session.jwtToken = jwtToken;
			res.redirect("/");
		} catch (error) {
			const status = axios.isAxiosError(error)
				? error.response?.status
				: undefined;
			const hasInvalidCredentials = status === 400 || status === 401;
			res.status(hasInvalidCredentials ? status : 500).render("login.njk", {
				errorMessage: hasInvalidCredentials
					? "Email or password is incorrect"
					: "Unable to sign in. Please try again later",
				formValues: { email },
			});
		}
	}

	async register(req: Request, res: Response): Promise<void> {
		const email = String(req.body.email ?? "").trim();
		const password = String(req.body.password ?? "");

		if (!email || !password) {
			res.status(400).render("register.njk", {
				errorMessage: "Enter both email and password",
				formValues: { email },
			});
			return;
		}

		try {
			const jwtToken = await this.userService.register(email, password);
			req.session.jwtToken = jwtToken;
			req.session.registrationSuccessMessage = "Account successfully created.";
			res.redirect("/");
		} catch (error) {
			const status = axios.isAxiosError(error)
				? error.response?.status
				: undefined;
			const hasInvalidRegistration = status === 400 || status === 409;
			res.status(hasInvalidRegistration ? status : 500).render("register.njk", {
				errorMessage: hasInvalidRegistration
					? "Unable to register with these details"
					: "Unable to register. Please try again later",
				formValues: { email },
			});
		}
	}

	logout(req: Request, res: Response): void {
		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.redirect("/login");
		});
	}
}
