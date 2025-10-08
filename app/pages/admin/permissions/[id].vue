<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import { KeyRound as KeyIcon, Save } from 'lucide-vue-next'
import { permissions as allPerms } from '@/data/permissions'

definePageMeta({ layout: 'admin' })

const router = useRouter()
const route = useRoute()

const id = computed(() => Number(route.params.id))
const perm = computed(() => allPerms.find(p => p.id === id.value))

const key = ref(perm.value?.key ?? '')
const name = ref(perm.value?.name ?? '')
const description = ref(perm.value?.description ?? '')

function onSubmit() {
  const p = perm.value
  if (!p) return
  p.key = key.value
  p.name = name.value
  p.description = description.value
  router.push('/admin/permissions')
}
</script>

<template>
  <section>
    <PageHeader
      :title="perm ? perm.name : 'Permission'"
      description="Edit permission key and label"
      :breadcrumbs="[
        { label: 'Admin', to: '/admin' },
        { label: 'Permissions', to: '/admin/permissions' },
        { label: perm ? String(perm.id) : 'Permission', current: true },
      ]"
      :icon="KeyIcon"
    />

    <div v-if="!perm" class="text-gray-600 dark:text-gray-300">Permission not found.</div>
    <form v-else class="grid gap-5 max-w-3xl" @submit.prevent="onSubmit">
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Key</label>
        <input v-model="key" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
        <input v-model="name" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
        <textarea v-model="description" rows="3" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="flex gap-2">
        <button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
          <Save class="w-4 h-4" /> Save
        </button>
        <NuxtLink to="/admin/permissions" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">Cancel</NuxtLink>
      </div>
    </form>
  </section>
</template>

