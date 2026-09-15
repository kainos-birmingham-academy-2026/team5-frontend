import { Router } from "express";
import { AiAssistantController } from "../controllers/AiAssistantController";
import { requireAuthentication } from "../middleware/authMiddleware";
import { AiAssistantService } from "../services/AiAssistantService";

const router = Router();

const service = new AiAssistantService();
const controller = new AiAssistantController(service);

router.get("/assistant", requireAuthentication, (req, res) =>
	controller.showAssistant(req, res),
);
router.post("/assistant/questions", requireAuthentication, (req, res) =>
	controller.ask(req, res),
);

export default router;
