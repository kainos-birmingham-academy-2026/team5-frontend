import express from "express";
import JobRouter from "./routes/jobRouter";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(JobRouter);

app.listen(4000, () => {
	console.log("Frontend is running on http://localhost:4000");
});
