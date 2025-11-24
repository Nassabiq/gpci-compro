import {defineStore} from "pinia";
import {apiRequest, ApiError} from "@/utils/api";
import {useRbacStore} from "@/stores/rbac";

export type UserStatus = "active" | "inactive" | "pending";

export interface UserRecord {
	id: number;
	xid: string;
	name: string;
	email: string;
	status: UserStatus;
	createdAt?: string;
	updatedAt?: string;
	roles: string[];
}

interface ApiUser {
	id: number;
	xid: string;
	name: string;
	email: string;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
	email_verified_at?: string | null;
	roles?: string[];
}

interface CreateUserPayload {
	name: string;
	email: string;
	password: string;
	status?: UserStatus;
	role?: string | null;
}

interface UpdateUserPayload {
	name?: string;
	email?: string;
	password?: string;
	status?: UserStatus;
	role?: string | null;
}

function normalizeUser(user: ApiUser): UserRecord {
	const status: UserStatus = user.is_active ? "active" : "inactive";
	const createdAt = user.created_at ?? undefined;
	const updatedAt = user.updated_at ?? undefined;

	return {
		id: user.id,
		xid: user.xid,
		name: user.name,
		email: user.email,
		status,
		createdAt,
		updatedAt,
		roles: user.roles ?? [],
	};
}

export const useUsersStore = defineStore("users", {
	state: () => ({
		items: [] as UserRecord[],
		pending: false,
		error: null as string | null,
	}),
	getters: {
		findByXid: (state) => (xid: string) => state.items.find((u) => u.xid === xid) ?? null,
		findByEmail: (state) => (email: string) => state.items.find((u) => u.email === email) ?? null,
	},
	actions: {
		async fetch(force = false) {
			if (this.items.length && !force) return;
			this.pending = true;
			this.error = null;
			try {
				const data = await apiRequest<ApiUser[]>("users");
				this.items = data.map(normalizeUser);
			} catch (err: any) {
				const message = err?.message ?? "Failed to load users";
				this.error = message;
				if (err instanceof ApiError && err.status === 404) {
					this.items = [];
					return;
				}
				throw err;
			} finally {
				this.pending = false;
			}
		},
		async create(payload: CreateUserPayload) {
			await apiRequest("auth/register", {
				method: "POST",
				auth: false,
				body: {
					name: payload.name,
					email: payload.email,
					password: payload.password,
				},
			});

			await this.fetch(true);

			const created = this.findByEmail(payload.email);
			if (!created?.xid) return;

			if (payload.status && payload.status !== "active") {
				await apiRequest<ApiUser>(`users/${encodeURIComponent(created.xid)}`, {
					method: "PUT",
					body: {is_active: payload.status === "active"},
				});
			}

			if (payload.role) {
				const rbac = useRbacStore();
				await rbac.assignRoleToUser(created.xid, payload.role);
			}

			await this.fetch(true);
		},
		async update(xid: string, payload: UpdateUserPayload) {
			const body: Record<string, unknown> = {};
			if (payload.name != null) body.name = payload.name;
			if (payload.email != null) body.email = payload.email;
			if (payload.password) body.password = payload.password;
			if (payload.status) body.is_active = payload.status === "active";

			await apiRequest<ApiUser>(`users/${encodeURIComponent(xid)}`, {
				method: "PUT",
				body,
			});

			if (payload.role) {
				const rbac = useRbacStore();
				await rbac.assignRoleToUser(xid, payload.role);
			}

			await this.fetch(true);
		},
		async remove(xid: string) {
			await apiRequest<void>(`users/${encodeURIComponent(xid)}`, {
				method: "DELETE",
			});
			this.items = this.items.filter((u) => u.xid !== xid);
		},
	},
});
