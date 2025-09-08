<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'emerald' | 'blue' | 'rose' | 'gray'
type Size = 'sm' | 'md'

const props = withDefaults(defineProps<{
  value: unknown
  activeLabel?: string
  inactiveLabel?: string
  activeVariant?: Variant
  inactiveVariant?: Variant
  size?: Size
  showDot?: boolean
}>(), {
  activeLabel: 'Active',
  inactiveLabel: 'Inactive',
  activeVariant: 'emerald',
  inactiveVariant: 'gray',
  size: 'sm',
  showDot: true,
})

const isActive = computed(() => {
  const v = props.value
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v === 1
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    return s === 'true' || s === 'active' || s === '1'
  }
  return false
})

const palette: Record<Variant, { wrap: string; dot: string }> = {
  emerald: { wrap: 'bg-emerald-100 text-emerald-800 ring-emerald-200', dot: 'bg-emerald-600' },
  blue: { wrap: 'bg-blue-100 text-blue-800 ring-blue-200', dot: 'bg-blue-600' },
  rose: { wrap: 'bg-rose-100 text-rose-800 ring-rose-200', dot: 'bg-rose-600' },
  gray: { wrap: 'bg-gray-200 text-gray-700 ring-gray-300', dot: 'bg-gray-500' },
}

const cls = computed(() => {
  const base = 'inline-flex items-center gap-1.5 rounded-full ring-1'
  const size = props.size === 'md'
    ? 'px-2.5 py-1 text-xs'
    : 'px-2 py-0.5 text-[11px]'
  const p = isActive.value ? palette[props.activeVariant] : palette[props.inactiveVariant]
  return {
    wrap: `${base} ${size} ${p.wrap}`,
    dot: `h-1.5 w-1.5 rounded-full ${p.dot}`,
    label: 'font-medium',
  }
})

const label = computed(() => isActive.value ? props.activeLabel : props.inactiveLabel)
</script>

<template>
  <span :class="cls.wrap">
    <span v-if="showDot" :class="cls.dot" aria-hidden="true"></span>
    <span :class="cls.label">{{ label }}</span>
  </span>
</template>
