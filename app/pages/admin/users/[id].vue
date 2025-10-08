<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '@/components/admin/PageHeader.vue'
import { Users as UsersIcon, Save } from 'lucide-vue-next'
import { findUser, users as allUsers, type User, type UserStatus } from '@/data/users'
import { roles as allRoles } from '@/data/roles'

definePageMeta({ layout: 'admin' })

const router = useRouter()
const route = useRoute()

const id = computed(() => Number(route.params.id))
const user = computed(() => findUser(id.value))

const name = ref(user.value?.name ?? '')
const email = ref(user.value?.email ?? '')
const status = ref<UserStatus>(user.value?.status ?? 'active')
const roleId = ref<number | null>(user.value?.roleIds && user.value.roleIds.length ? user.value.roleIds[0] : null)
const newPassword = ref('')
const confirmPassword = ref('')


function onSubmit() {
  const u = user.value
  if (!u) return
  u.name = name.value
  u.email = email.value
  u.status = status.value
  u.roleIds = roleId.value != null ? [roleId.value] : []
  if (newPassword.value || confirmPassword.value) {
    if (newPassword.value.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    if (newPassword.value !== confirmPassword.value) {
      alert('Passwords do not match')
      return
    }
    u.password = newPassword.value
  }
  router.push('/admin/users')
}
</script>

<template>
  <section>
    <PageHeader
      :title="user ? user.name : 'User'"
      description="Edit user details and role assignments"
      :breadcrumbs="[
        { label: 'Admin', to: '/admin' },
        { label: 'Users', to: '/admin/users' },
        { label: user ? String(user.id) : 'User', current: true },
      ]"
      :icon="UsersIcon"
    />

    <div v-if="!user" class="text-gray-600 dark:text-gray-300">User not found.</div>
    <form v-else class="grid gap-5 max-w-3xl" @submit.prevent="onSubmit">
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
        <input v-model="name" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
        <input v-model="email" type="email" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
        <select v-model="status" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
          <option value="active">active</option>
          <option value="inactive">inactive</option>
          <option value="pending">pending</option>
        </select>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
        <select v-model="roleId" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
          <option :value="null">Select role</option>
          <option v-for="r in allRoles" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Set New Password</label>
        <input v-model="newPassword" type="password" minlength="6" placeholder="Leave blank to keep current" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>
      <div class="grid gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Confirm New Password</label>
        <input v-model="confirmPassword" type="password" minlength="6" placeholder="Leave blank to keep current" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
      </div>

      <div class="flex gap-2">
        <button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
          <Save class="w-4 h-4" /> Save
        </button>
        <NuxtLink to="/admin/users" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">Cancel</NuxtLink>
      </div>
    </form>
  </section>
</template>
