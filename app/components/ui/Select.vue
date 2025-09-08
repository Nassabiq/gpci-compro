<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		options: Array<string | number>;
		modelValue: string | number;
		placeholder?: string; // jika diisi, akan muncul sebagai option pertama = ''
		widthClass?: string; // mis. 'sm:w-48'; default 'w-full'
		asNumber?: boolean; // true untuk v-model number (page size)
		formatOption?: (v: string | number) => string; // render label custom per option
	}>(),
	{
		widthClass: "w-full",
		asNumber: false,
	}
);

const emit = defineEmits<{(e: "update:modelValue", v: string | number): void}>();
function onChange(e: Event) {
	const raw = (e.target as HTMLSelectElement).value;
	const val = props.asNumber ? Number(raw) : raw;
	emit("update:modelValue", val);
}
function labelOf(v: string | number) {
	return props.formatOption ? props.formatOption(v) : String(v);
}
</script>

<template>
	<select :value="modelValue" @change="onChange" class="border border-gray-300 text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" :class="widthClass">
		<option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
		<option v-for="opt in options" :key="String(opt)" :value="String(opt)">
			{{ labelOf(opt) }}
		</option>
	</select>
</template>
