import {computed, ref} from "vue";
import {apiRequest, ApiError} from "@/utils/api";

interface AuthUser {
	xid: string;
	email: string;
	name?: string;
	roles: string[];
	permissions: string[];
}

interface LoginResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

interface ProfileResponse {
	xid: string;
	name?: string | null;
	email: string;
	roles?: string[];
	permissions?: string[];
}

interface UpdateProfilePayload {
	name: string;
	email: string;
}

interface UpdateProfileResponse {
	xid: string;
	email: string;
	name?: string | null;
	roles?: string[];
	permissions?: string[];
}

interface UpdatePasswordPayload {
	currentPassword: string;
	password: string;
	confirmPassword: string;
}

function decodeBase64Url(input: string): string {
	const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
	const pad = normalized.length % 4;
	const padded = normalized + (pad ? "=".repeat(4 - pad) : "");

	if (typeof Buffer !== "undefined") {
		return Buffer.from(padded, "base64").toString("utf-8");
	}

	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new TextDecoder().decode(bytes);
}

function decodeJwt(token: string): Record<string, any> | null {
	const segments = token.split(".");
	if (segments.length < 2) return null;
	try {
		const payload = decodeBase64Url(segments[1]);
		return JSON.parse(payload);
	} catch {
		return null;
	}
}

export function useAuth() {
	const cookieOptions = {sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/"};
	const tokenCookie = useCookie<string | null>("access_token", cookieOptions);
	const expiryCookie = useCookie<number | null>("access_token_expires", cookieOptions);

	const token = useState<string | null>("auth:token", () => tokenCookie.value ?? null);
	const user = useState<AuthUser | null>("auth:user", () => null);
	const hydrated = useState<boolean>("auth:hydrated", () => false);
	const permissionsReady = useState<boolean>("auth:permissionsReady", () => false);

	const loading = ref(false);
	const lastError = ref<string | null>(null);

	function clearState() {
		token.value = null;
		user.value = null;
		tokenCookie.value = null;
		expiryCookie.value = null;
		hydrated.value = false;
		permissionsReady.value = false;
	}

	function applyToken(accessToken: string, expiresIn?: number) {
		token.value = accessToken;
		tokenCookie.value = accessToken;
		if (expiresIn && Number.isFinite(expiresIn)) {
			const expiresAt = Math.floor(Date.now() / 1000) + Math.max(0, Math.trunc(expiresIn));
			expiryCookie.value = expiresAt;
		} else {
			expiryCookie.value = null;
		}

		const payload = decodeJwt(accessToken);
		if (payload) {
			const existing = user.value;
			user.value = {
				xid: String(payload.sub ?? ""),
				email: String(payload.email ?? ""),
				name: typeof payload.name === "string" ? payload.name : undefined,
				roles: existing?.roles ?? [],
				permissions: existing?.permissions ?? [],
			};
		}
	}

	async function fetchMe(): Promise<AuthUser | null> {
		if (!token.value) {
			permissionsReady.value = false;
			hydrated.value = true;
			return null;
		}
		try {
			const data = await apiRequest<ProfileResponse>("profile");
			const next: AuthUser = {
				xid: data.xid,
				email: data.email,
				name: data.name ?? undefined,
				roles: data.roles ?? [],
				permissions: data.permissions ?? [],
			};
			user.value = next;
			permissionsReady.value = true;
			return next;
		} catch (err) {
			if (err instanceof ApiError && err.status === 401) {
				clearState();
			}
			throw err;
		} finally {
			hydrated.value = true;
		}
	}

	async function hydrateFromCookie(): Promise<AuthUser | null> {
		if (hydrated.value) return user.value;
		hydrated.value = true;

		const now = Math.floor(Date.now() / 1000);
		if (!tokenCookie.value || (expiryCookie.value && expiryCookie.value <= now)) {
			clearState();
			return null;
		}

		applyToken(tokenCookie.value, expiryCookie.value ? expiryCookie.value - Math.floor(Date.now() / 1000) : undefined);

		try {
			return await fetchMe();
		} catch {
			return user.value;
		}
	}

	async function login(email: string, password: string): Promise<void> {
		loading.value = true;
		lastError.value = null;
		try {
			const data = await apiRequest<LoginResponse>("auth/login", {
				method: "POST",
				auth: false,
				body: {email, password},
			});
			applyToken(data.access_token, data.expires_in);
			await fetchMe().catch(() => null);
		} catch (err: any) {
			if (err instanceof ApiError) {
				lastError.value = err.message;
				if (err.status === 401) clearState();
			} else {
				lastError.value = "Unable to sign in. Please try again.";
			}
			throw err;
		} finally {
			loading.value = false;
		}
	}

	function logout() {
		clearState();
	}

	async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
		const body = {
			name: payload.name,
			email: payload.email,
		};

		try {
			const data = await apiRequest<UpdateProfileResponse>("profile", {
				method: "PUT",
				body,
			});
			const merged: AuthUser = {
				xid: data.xid ?? user.value?.xid ?? "",
				email: data.email ?? user.value?.email ?? "",
				name: data.name ?? user.value?.name,
				roles: data.roles ?? user.value?.roles ?? [],
				permissions: data.permissions ?? user.value?.permissions ?? [],
			};
			user.value = merged;
			permissionsReady.value = true;
			return merged;
		} catch (err) {
			if (err instanceof ApiError) {
				throw err;
			}
			throw new ApiError("Failed to update profile");
		}
	}

	async function updatePassword(payload: UpdatePasswordPayload): Promise<AuthUser | null> {
		const body = {
			current_password: payload.currentPassword,
			password: payload.password,
			password_confirmation: payload.confirmPassword,
		};

		try {
			const data = await apiRequest<UpdateProfileResponse>("profile/password", {
				method: "PUT",
				body,
			});
			if (data) {
				const merged: AuthUser = {
					xid: data.xid ?? user.value?.xid ?? "",
					email: data.email ?? user.value?.email ?? "",
					name: data.name ?? user.value?.name,
					roles: data.roles ?? user.value?.roles ?? [],
					permissions: data.permissions ?? user.value?.permissions ?? [],
				};
				user.value = merged;
				permissionsReady.value = true;
				return merged;
			}
			return user.value;
		} catch (err) {
			if (err instanceof ApiError) {
				throw err;
			}
			throw new ApiError("Failed to update password");
		}
}

	const isTokenExpired = computed(() => {
		const exp = expiryCookie.value;
		return !!exp && exp <= Math.floor(Date.now() / 1000);
	});

	const permissionsList = computed(() => user.value?.permissions ?? []);
	const rolesList = computed(() => user.value?.roles ?? []);
	const permissionsLoaded = computed(() => permissionsReady.value);

	function hasPermission(permission: string): boolean {
		return permissionsList.value.includes(permission);
	}

	function hasAnyPermission(perms: string[]): boolean {
		return perms.some((perm) => hasPermission(perm));
	}

	function hasAllPermissions(perms: string[]): boolean {
		return perms.every((perm) => hasPermission(perm));
	}

	function hasRole(role: string): boolean {
		return rolesList.value.includes(role);
	}

	async function ensurePermissionsLoaded(): Promise<void> {
		if (permissionsReady.value) return;
		if (!hydrated.value) {
			await hydrateFromCookie();
		}
		if (!permissionsReady.value && token.value) {
			await fetchMe().catch(() => null);
		}
	}

	return {
		token,
		user,
		loading,
		lastError,
		isAuthenticated: computed(() => !!token.value),
		tokenExpiresAt: computed(() => expiryCookie.value ?? null),
		isTokenExpired,
		roles: rolesList,
		permissions: permissionsList,
		permissionsLoaded,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		hasRole,
		ensurePermissionsLoaded,
		login,
		logout,
		hydrateFromCookie,
		fetchMe,
		updateProfile,
		updatePassword,
	};
}
