import type {FetchOptions} from "ofetch";

export interface ApiErrorPayload {
	code: string;
	message: string;
	details?: unknown;
}

export interface ApiEnvelope<T> {
	data: T;
	meta?: unknown;
	error?: ApiErrorPayload;
	trace_id?: string;
}

export class ApiError extends Error {
	status?: number;
	code?: string;
	details?: unknown;
	traceId?: string;

	constructor(message: string, init?: Partial<ApiError>) {
		super(message);
		this.name = "ApiError";
		Object.assign(this, init);
	}
}

export type ApiRequestOptions<T> = Omit<FetchOptions<T>, "baseURL"> & {
	/**
	 * Include the bearer token automatically.
	 * Set to false to skip.
	 */
	auth?: boolean;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions<"json"> = {}): Promise<T> {
	const config = useRuntimeConfig();
	const token = useState<string | null>("auth:token", () => null);
	const headers = new Headers((options.headers as HeadersInit | undefined) ?? {});

	if (options.auth !== false && token.value) {
		headers.set("Authorization", `Bearer ${token.value}`);
	}

	// Only set JSON header when body is a plain object
	const body = options.body;
	if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	try {
		const envelope = await $fetch<ApiEnvelope<T>>(normalizedPath, {
			...options,
			baseURL: config.public.apiBase,
			headers,
		});

		return envelope.data;
	} catch (err: any) {
		const status = err?.response?.status;
		const payload = err?.data as ApiEnvelope<unknown> | undefined;
		const errorBody = payload?.error;

		throw new ApiError(errorBody?.message ?? err?.message ?? "Request failed", {
			status,
			code: errorBody?.code,
			details: errorBody?.details,
			traceId: payload?.trace_id,
		});
	}
}
