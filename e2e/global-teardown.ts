import fs from "node:fs/promises";
import { ARTIFACT_DIR, readRunContext } from "./config/run-context";

export default async function globalTeardown(): Promise<void> {
	const context = readRunContext();

	if (context) {
		const durationMs = Date.now() - new Date(context.startedAt).getTime();
		console.log(
			`[global-teardown] ${context.environment} run finished in ${Math.round(durationMs / 1000)}s`,
		);
	} else {
		console.log("[global-teardown] no run context found.");
	}

	// Session cookies must not outlive the run.
	await fs.rm(ARTIFACT_DIR, { recursive: true, force: true });
}
