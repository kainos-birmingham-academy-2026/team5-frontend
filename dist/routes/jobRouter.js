import { Router } from "express";
const router = Router();
router.get("/health", (req, res) => {
    res.json({ status: "UP", time: new Date().toISOString() });
});
router.get("/", (req, res) => {
    res.send("<h1>Hello World</h1>");
});
export default router;
