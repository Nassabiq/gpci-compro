// plugins/dark-init.client.ts
export default defineNuxtPlugin(() => {
	try {
		const saved = localStorage.getItem("theme");
		const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
		document.documentElement.classList.toggle("dark", isDark);
	} catch {}
});
