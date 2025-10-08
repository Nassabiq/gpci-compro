<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'

definePageMeta({ layout: 'landing' })

const router = useRouter()
const route = useRoute()
const email = ref('')
const password = ref('')
const error = ref('')

const { login } = useAuth()

function onSubmit() {
  error.value = ''
  const ok = login(email.value.trim(), password.value)
  if (!ok) {
    error.value = 'Invalid email or password'
    return
  }
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
  router.push(redirect || '/admin')
}
</script>

<template>
  <section class="max-w-md mx-auto py-10">
    <PageHeader title="Sign In" description="Access the admin dashboard" :breadcrumbs="[{ label: 'Login', current: true }]" />

    <form class="grid gap-5" @submit.prevent="onSubmit">
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
        <input v-model="email" type="email" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
        <input v-model="password" type="password" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      <div>
        <button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">Sign In</button>
      </div>
    </form>
  </section>
  
</template>

