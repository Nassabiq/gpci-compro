// composables/useDarkMode.ts
export function useDarkMode() {
	const isDark = useState<boolean>("isDark", () => false);

	function apply(mode: "dark" | "light") {
		const root = document.documentElement;
		if (mode === "dark") root.classList.add("dark");
		else root.classList.remove("dark");
	}

	function init() {
		if (process.server) return;
		const saved = localStorage.getItem("theme");
		if (saved === "dark" || saved === "light") {
			isDark.value = saved === "dark";
		} else {
			isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
		}
		apply(isDark.value ? "dark" : "light");
	}

	function toggleDark() {
		if (process.server) return;
		isDark.value = !isDark.value;
		const mode: "dark" | "light" = isDark.value ? "dark" : "light";
		localStorage.setItem("theme", mode);
		apply(mode);
	}

	onMounted(init);
	return {isDark, toggleDark};
}
