import fs from "node:fs";
import path from "node:path";

export type RunContext = {
	environment: string;
	startedAt: string;
	apiUp: boolean;
	authenticated: boolean;
};

export const ARTIFACT_DIR = path.join(process.cwd(), "e2e", ".artifacts");
export const RUN_CONTEXT_FILE = path.join(ARTIFACT_DIR, "run-context.json");
export const STORAGE_STATE = path.join(ARTIFACT_DIR, "authenticated-user.json");

export const writeRunContext = (context: RunContext): void => {
	fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
	fs.writeFileSync(RUN_CONTEXT_FILE, JSON.stringify(context, null, 2), "utf8");
};

export const readRunContext = (): RunContext | null => {
	try {
		return JSON.parse(fs.readFileSync(RUN_CONTEXT_FILE, "utf8")) as RunContext;
	} catch {
		return null;
	}
};
