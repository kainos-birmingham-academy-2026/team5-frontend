import express from "express";
import jobRouter from "./routes/jobRouter";

const app = express();
app.use(express.json());
app.use(jobRouter);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});