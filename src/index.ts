import express from "express";
import JobRouter from "./routes/JobRouter";
import "dotenv/config";
import nunjucks from "nunjucks";
import path from "path";

const app = express();

nunjucks.configure(path.join(process.cwd(), "src/views"), {
	autoescape: true,
	express: app,
	noCache: true,
});

app.set("view engine", "html");

app.use(express.json());
app.use("/assets", express.static(path.join(process.cwd(), "src/views/assets")));
app.use(JobRouter);

app.listen(4000, () => {
	console.log("Frontend is running on http://localhost:4000");
});
