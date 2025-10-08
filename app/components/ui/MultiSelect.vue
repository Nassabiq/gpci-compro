<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'

type OptVal = string | number
export interface Option { value: OptVal; label: string }

const props = withDefaults(defineProps<{
  options: Option[]
  modelValue: OptVal[]
  placeholder?: string
  widthClass?: string
  searchable?: boolean
  clearable?: boolean
  maxDropdownHeight?: string
}>(), {
  widthClass: 'sm:w-80',
  searchable: true,
  clearable: true,
  maxDropdownHeight: '16rem',
})

const emit = defineEmits<{ (e: 'update:modelValue', v: OptVal[]): void }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
useClickOutside(root, () => { open.value = false })

const search = ref('')
const selected = computed<Set<OptVal>>({
  get: () => new Set(props.modelValue ?? []),
  set: (s: Set<OptVal>) => emit('update:modelValue', Array.from(s)),
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.options
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

function toggleOpen() { open.value = !open.value }
function isChecked(v: OptVal) { return selected.value.has(v) }
function setChecked(v: OptVal, checked: boolean) {
  const s = new Set(selected.value)
  checked ? s.add(v) : s.delete(v)
  selected.value = s
}
function clearAll() { selected.value = new Set() }

const displayText = computed(() => {
  const optsByVal = new Map(props.options.map(o => [o.value, o.label]))
  const labels = (props.modelValue ?? []).map(v => optsByVal.get(v) ?? String(v))
  if (labels.length === 0) return props.placeholder ?? 'Select options'
  if (labels.length <= 2) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
})
</script>

<template>
  <div ref="root" class="relative">
    <button type="button" class="w-full inline-flex items-center justify-between gap-2 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 px-3 py-2 text-left shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500" :class="widthClass" @click="toggleOpen">
      <span class="truncate">{{ displayText }}</span>
      <span class="text-gray-400">▾</span>
    </button>

    <div v-if="open" class="absolute z-50 mt-2 w-[22rem] max-w-[88vw] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
      <div class="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2" v-if="searchable">
        <input v-model="search" type="text" placeholder="Search..." class="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:ring-emerald-500 focus:border-emerald-500" />
        <button v-if="clearable" class="px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" @click="clearAll">Clear</button>
      </div>

      <ul class="py-1 overflow-auto" :style="{ maxHeight: maxDropdownHeight }">
        <li v-for="opt in filtered" :key="String(opt.value)" class="px-2 py-1">
          <label class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
            <input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" :checked="isChecked(opt.value)" @change="setChecked(opt.value, ($event.target as HTMLInputElement).checked)" />
            <span class="text-sm text-gray-800 dark:text-gray-100">{{ opt.label }}</span>
          </label>
        </li>
        <li v-if="filtered.length === 0" class="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No options</li>
      </ul>

      <div class="p-2 border-t border-gray-100 dark:border-gray-700 text-right">
        <button class="rounded-lg bg-emerald-600 text-white text-sm px-3 py-1.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" @click="open=false">Done</button>
      </div>
    </div>
  </div>
</template>

