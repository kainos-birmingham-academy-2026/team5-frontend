import type { APIRequestContext, APIResponse } from "@playwright/test";

export type ApiResult<T> = {
	status: number;
	ok: boolean;
	body: T;
};

export type QueryParams = Record<
	string,
	string | number | boolean | string[] | undefined
>;

export abstract class BaseApiClient {
	constructor(
		protected readonly request: APIRequestContext,
		protected readonly baseURL: string,
	) {}

	protected url(path: string, params?: QueryParams): string {
		const base = `${this.baseURL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
		const query = this.queryString(params);
		return query ? `${base}?${query}` : base;
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
		params?: QueryParams,
	): Promise<ApiResult<T>> {
		const response = await this.request.get(this.url(path, params), {
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

	/** Arrays are sent as repeated keys, which is what the backend expects. */
	private queryString(params?: QueryParams): string {
		if (!params) return "";

		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined) continue;
			for (const item of Array.isArray(value) ? value : [value]) {
				search.append(key, String(item));
			}
		}
		return search.toString();
	}
}
