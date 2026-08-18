import { BaseApiClient } from "./BaseApiClient";

export type HealthResponse = {
	status: string;
	time: string;
};

/** Hits the frontend health endpoint exposed by JobRouter. */
export class HealthApiClient extends BaseApiClient {
	check() {
		return this.get<HealthResponse>("/health");
	}
}
