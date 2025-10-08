<script setup lang="ts">
import Modal from '@/components/ui/Modal.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  widthClass?: string
}>(), {
  title: 'Confirm Deletion',
  message: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  widthClass: 'sm:max-w-md',
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<template>
  <Modal :model-value="modelValue" :title="title" :width-class="widthClass" @update:modelValue="(v:boolean)=>$emit('update:modelValue', v)">
    <div class="text-gray-700 dark:text-gray-200">
      <slot>
        {{ message }}
      </slot>
    </div>
    <template #footer>
      <button type="button" class="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" @click="close">{{ cancelLabel }}</button>
      <button type="button" class="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-400 dark:focus:ring-red-800" @click="confirm">{{ confirmLabel }}</button>
    </template>
  </Modal>
</template>

