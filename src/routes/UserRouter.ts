import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";

const router = Router();

const service = new UserService();
const controller = new UserController(service);

router.get("/login", (req, res) => controller.showLogin(req, res));
router.post("/login", (req, res) => controller.login(req, res));
router.get("/register", (req, res) => controller.showRegister(req, res));
router.post("/register", (req, res) => controller.register(req, res));
router.get("/logout", (req, res) => controller.logout(req, res));

export default router;
