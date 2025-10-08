<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  widthClass?: string
  closeOnBackdrop?: boolean
}>(), {
  widthClass: 'sm:max-w-2xl',
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'close'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <transition enter-active-class="duration-150 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/40" @click="closeOnBackdrop ? close() : undefined" />
        <div class="relative w-full max-w-full" :class="widthClass">
          <div class="relative rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white truncate">{{ title }}</h3>
              <button class="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" @click="close" aria-label="Close">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="px-4 py-4">
              <slot />
            </div>
            <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60">
              <div class="flex items-center justify-end gap-2">
                <slot name="footer">
                  <button type="button" class="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" @click="close">Close</button>
                </slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
  
</template>

