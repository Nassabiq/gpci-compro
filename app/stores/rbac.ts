import {defineStore} from "pinia";
import {apiRequest, ApiError} from "@/utils/api";

export interface RbacRole {
	id: number;
	name: string;
	created_at?: string;
	updated_at?: string;
}

export interface RbacPermission {
	id: number;
	key: string;
	description?: string | null;
	created_at?: string;
	updated_at?: string;
}

interface CreateRoleResponse {
	id: number;
	name: string;
}

interface CreatePermissionResponse {
	id: number;
	key: string;
}

export const useRbacStore = defineStore("rbac", {
	state: () => ({
		roles: [] as RbacRole[],
		permissions: [] as RbacPermission[],
		loadingRoles: false,
		loadingPermissions: false,
		rolesError: null as string | null,
		permissionsError: null as string | null,
	}),
	actions: {
		async fetchRoles(force = false) {
			if (this.roles.length && !force) return;
			this.loadingRoles = true;
			this.rolesError = null;
			try {
				this.roles = await apiRequest<RbacRole[]>("rbac/roles");
			} catch (err: any) {
				this.rolesError = err?.message ?? "Failed to load roles";
				throw err;
			} finally {
				this.loadingRoles = false;
			}
		},
		async fetchPermissions(force = false) {
			if (this.permissions.length && !force) return;
			this.loadingPermissions = true;
			this.permissionsError = null;
			try {
				this.permissions = await apiRequest<RbacPermission[]>("rbac/permissions");
			} catch (err: any) {
				this.permissionsError = err?.message ?? "Failed to load permissions";
				throw err;
			} finally {
				this.loadingPermissions = false;
			}
		},
		async createRole(name: string): Promise<CreateRoleResponse> {
			const result = await apiRequest<CreateRoleResponse>("rbac/roles", {
				method: "POST",
				body: {name},
			});
			await this.fetchRoles(true);
			return result;
		},
		async createPermission(key: string, description: string) {
			const result = await apiRequest<CreatePermissionResponse>("rbac/permissions", {
				method: "POST",
				body: {key, description},
			});
			await this.fetchPermissions(true);
			return result;
		},
		async assignPermissionToRole(roleName: string, permissionKey: string) {
			try {
				await apiRequest<void>(`rbac/roles/${encodeURIComponent(roleName)}/permissions`, {
					method: "POST",
					body: {permission: permissionKey},
				});
			} catch (err) {
				if (err instanceof ApiError) {
					throw err;
				}
				throw new ApiError("Failed to assign permission to role");
			}
		},
		async assignRoleToUser(userXid: string, roleName: string) {
			try {
				await apiRequest<void>(`rbac/users/${encodeURIComponent(userXid)}/roles`, {
					method: "POST",
					body: {role: roleName},
				});
			} catch (err) {
				if (err instanceof ApiError) {
					throw err;
				}
				throw new ApiError("Failed to assign role to user");
			}
		},
	},
});
