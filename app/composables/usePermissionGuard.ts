import {createError} from "h3";

type PermissionMode = "all" | "any";

interface PermissionGuardOptions {
	mode?: PermissionMode;
}

function normalize(required: string | string[]): string[] {
	return Array.isArray(required) ? required : [required];
}

export async function requirePermission(required: string | string[], options: PermissionGuardOptions = {}) {
	const mode = options.mode ?? "all";
	const auth = useAuth();

	await auth.ensurePermissionsLoaded();

	const permissions = normalize(required);
	const allowed =
		mode === "any"
			? auth.hasAnyPermission(permissions)
			: auth.hasAllPermissions(permissions);

	if (!allowed) {
		throw createError({statusCode: 403, statusMessage: "Forbidden"});
	}

	return auth;
}

export async function ensurePermissions() {
	const auth = useAuth();
	await auth.ensurePermissionsLoaded();
	return auth;
}
