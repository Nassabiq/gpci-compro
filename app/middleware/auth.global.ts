export default defineNuxtRouteMiddleware(async (to) => {
	if (!to.path.startsWith("/admin")) return;

	const auth = useAuth();
	const expiresAt = auth.tokenExpiresAt.value;
	if (expiresAt && expiresAt <= Math.floor(Date.now() / 1000)) {
		auth.logout();
		const redirect = encodeURIComponent(to.fullPath);
		return navigateTo(`/login?redirect=${redirect}`);
	}
	if (!auth.isAuthenticated.value) {
		await auth.hydrateFromCookie();
	}
	if (auth.isTokenExpired.value) {
		auth.logout();
		const redirect = encodeURIComponent(to.fullPath);
		return navigateTo(`/login?redirect=${redirect}`);
	}
	if (auth.isAuthenticated.value && !auth.user.value) {
		try {
			await auth.fetchMe();
		} catch {
			// ignore, fetchMe will clear state on 401
		}
	}
	if (!auth.isAuthenticated.value) {
		const redirect = encodeURIComponent(to.fullPath);
		return navigateTo(`/login?redirect=${redirect}`);
	}
});
