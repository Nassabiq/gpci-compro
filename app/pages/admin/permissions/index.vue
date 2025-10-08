<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/admin/PageHeader.vue'
import DataTable, { type Column } from '@/components/ui/DataTable.vue'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { permissions as allPerms, type Permission } from '@/data/permissions'
import { KeyRound as KeyIcon, Plus, Edit, Trash2, Save } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const search = ref('')
const page = ref(1)
const pageSize = ref(10)

// modal + form state
const showPermModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const key = ref('')
const name = ref('')
const description = ref('')

function resetForm() {
  key.value = ''
  name.value = ''
  description.value = ''
}
function openCreate() {
  resetForm()
  isEditing.value = false
  editingId.value = null
  showPermModal.value = true
}
function openEdit(p: Permission) {
  isEditing.value = true
  editingId.value = p.id
  key.value = p.key
  name.value = p.name
  description.value = p.description || ''
  showPermModal.value = true
}
function savePermission() {
  if (isEditing.value && editingId.value != null) {
    const p = allPerms.find(x => x.id === editingId.value)
    if (p) {
      p.key = key.value
      p.name = name.value
      p.description = description.value
    }
  } else {
    const id = Math.max(0, ...allPerms.map(p => p.id)) + 1
    allPerms.push({ id, key: key.value, name: name.value, description: description.value })
  }
  showPermModal.value = false
}

const columns: Column[] = [
  { key: 'key', label: 'Key', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'actions', label: 'Actions', align: 'right', width: '120px' },
]

const rows = computed(() => allPerms)

// Delete confirmation state
const showDelete = ref(false)
const deleting = ref<Permission | null>(null)
function askDelete(p: Permission) {
  deleting.value = p
  showDelete.value = true
}
function confirmDelete() {
  const p = deleting.value as Permission | null
  if (!p) return
  const i = allPerms.findIndex(x => x.id === p.id)
  if (i >= 0) allPerms.splice(i, 1)
  deleting.value = null
}

// Derived confirm dialog texts to keep template simple
const deleteTitle = computed(() => (deleting.value ? 'Delete Permission' : 'Delete'))
const deleteMessage = computed(() => deleting.value
  ? `Are you sure you want to delete permission "${deleting.value.key}"? This cannot be undone.`
  : ''
)
</script>

<template>
  <section>
    <PageHeader
      title="Permissions"
      description="Manage permission keys and labels"
      :breadcrumbs="[
        { label: 'Admin', to: '/admin' },
        { label: 'Permissions', current: true },
      ]"
      :icon="KeyIcon"
    >
      <template #actions>
        <button type="button" @click="openCreate" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
          <Plus class="w-4 h-4" /> New Permission
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
    
    <!-- Modal: Create/Edit Permission -->
    <Modal v-model="showPermModal" :title="isEditing ? 'Edit Permission' : 'New Permission'">
      <form class="grid gap-5" @submit.prevent="savePermission">
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Key</label>
          <input v-model="key" type="text" required placeholder="e.g., user.create" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
          <input v-model="name" type="text" required class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
        <div class="grid gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
          <textarea v-model="description" rows="3" class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
        </div>
      </form>
      <template #footer>
        <button type="button" class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700" @click="showPermModal=false">Cancel</button>
        <button type="button" @click="savePermission" class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:focus:ring-emerald-800">
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
