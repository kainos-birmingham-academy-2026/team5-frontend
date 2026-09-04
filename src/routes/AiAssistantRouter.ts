import { Router } from "express";
import { AiAssistantController } from "../controllers/AiAssistantController";
import { AiAssistantService } from "../services/AiAssistantService";

const router = Router();

const service = new AiAssistantService();
const controller = new AiAssistantController(service);

router.get("/assistant", (req, res) => controller.showAssistant(req, res));
router.post("/assistant/questions", (req, res) => controller.ask(req, res));

export default router;
