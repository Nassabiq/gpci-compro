import {onMounted, onBeforeUnmount} from "vue";

export function useClickOutside(rootRef: {value: HTMLElement | null}, handler: (e: MouseEvent) => void) {
	const onDocClick = (e: MouseEvent) => {
		const root = rootRef.value;
		if (!root) return;
		const target = e.target as Node;
		if (!root.contains(target)) handler(e);
	};
	onMounted(() => document.addEventListener("click", onDocClick));
	onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
}
