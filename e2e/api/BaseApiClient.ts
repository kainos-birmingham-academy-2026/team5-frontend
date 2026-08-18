import type { APIRequestContext, APIResponse } from "@playwright/test";

export type ApiResult<T> = {
	status: number;
	ok: boolean;
	body: T;
};

export abstract class BaseApiClient {
	constructor(
		protected readonly request: APIRequestContext,
		protected readonly baseURL: string,
	) {}

	protected url(path: string): string {
		return `${this.baseURL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
	}

	protected async toResult<T>(response: APIResponse): Promise<ApiResult<T>> {
		const raw = await response.text();
		let body: T;

		try {
			body = raw ? (JSON.parse(raw) as T) : (null as T);
		} catch {
			body = raw as unknown as T;
		}

		return { status: response.status(), ok: response.ok(), body };
	}

	protected async get<T>(
		path: string,
		params?: Record<string, string | number | boolean | string[]>,
	): Promise<ApiResult<T>> {
		const response = await this.request.get(this.url(path), {
			params: this.flatten(params),
			failOnStatusCode: false,
		});
		return this.toResult<T>(response);
	}

	protected async post<T>(
		path: string,
		data: unknown,
		headers?: Record<string, string>,
	): Promise<ApiResult<T>> {
		const response = await this.request.post(this.url(path), {
			data: data as Record<string, unknown>,
			headers,
			failOnStatusCode: false,
		});
		return this.toResult<T>(response);
	}

	private flatten(
		params?: Record<string, string | number | boolean | string[]>,
	): Record<string, string | number | boolean> | undefined {
		if (!params) return undefined;

		const flattened: Record<string, string | number | boolean> = {};
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined) continue;
			// Playwright params do not support arrays; repeat-style keys are joined.
			flattened[key] = Array.isArray(value) ? value.join(",") : value;
		}
		return flattened;
	}
}
