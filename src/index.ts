import "dotenv/config";
import path from "node:path";
import express from "express";
import session from "express-session";
import nunjucks from "nunjucks";
import JobRouter from "./routes/JobRouter";
import UserRouter from "./routes/UserRouter";

const app = express();

nunjucks.configure(path.join(process.cwd(), "src/views"), {
	autoescape: true,
	express: app,
	noCache: true,
});

app.set("view engine", "njk");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		secret: process.env.SESSION_SECRET ?? "dev-session-secret",
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 1000 * 60 * 60,
		},
	}),
);
app.use((req, res, next) => {
	res.locals.isAuthenticated = Boolean(req.session.jwtToken);
	next();
});
app.use(
	"/assets",
	express.static(path.join(process.cwd(), "dist/views/assets")),
);
app.use(
	"/assets",
	express.static(path.join(process.cwd(), "src/views/assets")),
);
app.use(UserRouter);
app.use(JobRouter);

app.listen(4000, () => {
	console.log("Frontend is running on http://localhost:4000");
});
