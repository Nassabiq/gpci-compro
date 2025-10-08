<script setup lang="ts">
import { computed, ref } from 'vue'
import { users as allUsers, type User, type UserStatus } from '@/data/users'
import { roles as allRoles } from '@/data/roles'
import PageHeader from '@/components/admin/PageHeader.vue'
import DataTable, { type Column } from '@/components/ui/DataTable.vue'
import DropdownCheckbox from '@/components/ui/DropdownCheckbox.vue'
import Select from '@/components/ui/Select.vue'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { Users as UsersIcon, Plus, Edit, Trash2, Save } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const search = ref('')
const page = ref(1)
const pageSize = ref(10)
const statusFilter = ref<string>('')
const roleFilter = ref<string[]>([])

// modal state & form
const showUserModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const name = ref('')
const email = ref('')
const status = ref<UserStatus>('active')
const roleId = ref<number | null>(null)
const password = ref('')
const confirmPassword = ref('')

function resetForm() {
  name.value = ''
  email.value = ''
  status.value = 'active'
  roleId.value = null
  password.value = ''
  confirmPassword.value = ''
}
function openCreate() {
  resetForm()
  isEditing.value = false
  editingId.value = null
  showUserModal.value = true
}
function openEdit(u: User) {
  isEditing.value = true
  editingId.value = u.id
  name.value = u.name
  email.value = u.email
  status.value = u.status
  roleId.value = u.roleIds.length ? u.roleIds[0] : null
  showUserModal.value = true
}
function saveUser() {
  if (isEditing.value && editingId.value != null) {
    const u = allUsers.find(x => x.id === editingId.value)
    if (u) {
      u.name = name.value
      u.email = email.value
      u.status = status.value
      u.roleIds = roleId.value != null ? [roleId.value] : []
      if (password.value || confirmPassword.value) {
        if (password.value.length < 6) {
          alert('Password must be at least 6 characters')
          return
        }
        if (password.value !== confirmPassword.value) {
          alert('Passwords do not match')
          return
        }
        u.password = password.value
      }
    }
  } else {
    if (password.value.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    if (password.value !== confirmPassword.value) {
      alert('Passwords do not match')
      return
    }
    const id = Math.max(0, ...allUsers.map(u => u.id)) + 1
    const newUser: User = { id, name: name.value, email: email.value, status: status.value, roleIds: roleId.value != null ? [roleId.value] : [], createdAt: new Date().toISOString(), password: password.value }
    allUsers.push(newUser)
  }
  showUserModal.value = false
}

const columns: Column[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'roles', label: 'Roles' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'createdAt', label: 'Created', sortable: true },
  { key: 'actions', label: 'Actions', align: 'right', width: '140px' },
]

const roleOptions = computed(() => allRoles.map(r => r.name))

const rows = computed(() => {
  let data = allUsers.map(u => ({
    ...u,
    roles: u.roleIds.map(rid => allRoles.find(r => r.id === rid)?.name || '').filter(Boolean).join(', '),
  }))

  if (statusFilter.value) data = data.filter(u => u.status === statusFilter.value)
  if (roleFilter.value.length) {
    data = data.filter(u => u.roleIds.some(rid => roleFilter.value.includes(allRoles.find(r => r.id === rid)?.name || '')))
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    data = data.filter(u => JSON.stringify(u).toLowerCase().includes(q))
  }
  return data
})

function resetFilters() {
  statusFilter.value = ''
  roleFilter.value = []
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

// Delete confirmation state
const showDelete = ref(false)
const deleting = ref<User | null>(null)
function askDelete(u: User) {
  deleting.value = u
  showDelete.value = true
}
function confirmDelete() {
  const u = deleting.value as User | null
  if (!u) return
  const i = allUsers.findIndex(x => x.id === u.id)
  if (i >= 0) allUsers.splice(i, 1)
  deleting.value = null
}
const deleteTitle = computed(() => (deleting.value ? 'Delete User' : 'Delete'))
const deleteMessage = computed(() => deleting.value ? `Are you sure you want to delete user "${deleting.value.name}"? This cannot be undone.` : '')
</script>

<template>
  <section>
    <PageHeader
      title="Users"
      description="Manage users, statuses, and role assignments"
      :breadcrumbs="[
        { label: 'Admin', to: '/admin' },
        { label: 'Users', current: true },
      ]"
      :icon="UsersIcon"
    >
      <template #actions>
        <button type="button" @click="openCreate" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
          <Plus class="w-4 h-4" /> New User
        </button>
      </template>
    </PageHeader>

    <DataTable
      :columns="columns"
      :rows="rows"
      v-model:search="search"
      v-model:page="page"
      v-model:pageSize="pageSize"
      :externalSort="false"
      rowKey="id"
    >
      <template #filters>
        <div class="flex flex-wrap gap-3 items-center">
          <Select :options="['active','inactive','pending']" v-model="statusFilter" placeholder="All statuses" widthClass="sm:w-48" />
          <DropdownCheckbox v-model="roleFilter" :options="roleOptions" placeholder="Filter roles" />
        </div>
      </template>

      <template #cell-createdAt="{ value }">{{ formatDate(value) }}</template>
      <template #cell-status="{ value }">
        <span :class="[
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          value === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100' :
          value === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-200' :
          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100']
        ">{{ value }}</span>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <button @click="openEdit(row)" class="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
            <Edit class="w-4 h-4" /> Edit
          </button>
          <button class="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30" @click="askDelete(row)">
            <Trash2 class="w-4 h-4" /> Delete
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Modal: Create/Edit User -->
    <Modal v-model="showUserModal" :title="isEditing ? 'Edit User' : 'New User'">
      <form class="grid gap-5" @submit.prevent="saveUser">
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
          <input v-model="name" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
          <input v-model="email" type="email" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ isEditing ? 'New Password' : 'Password' }}</label>
          <input v-model="password" :required="!isEditing" minlength="6" type="password" :placeholder="isEditing ? 'Leave blank to keep current' : ''" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ isEditing ? 'Confirm New Password' : 'Confirm Password' }}</label>
          <input v-model="confirmPassword" :required="!isEditing" minlength="6" type="password" :placeholder="isEditing ? 'Leave blank to keep current' : ''" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
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
      </form>
      <template #footer>
        <button type="button" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" @click="showUserModal=false">Cancel</button>
        <button type="button" @click="saveUser" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
          <Save class="w-4 h-4" /> Save
        </button>
      </template>
    </Modal>
    
    <!-- Confirm Delete -->
    <ConfirmDialog
      v-model="showDelete"
      :title="deleteTitle"
      :message="deleteMessage"
      confirm-label="Delete"
      cancel-label="Cancel"
      @confirm="confirmDelete"
    />
  </section>
  
</template>
