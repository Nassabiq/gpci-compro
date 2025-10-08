<script setup lang="ts">
const router = useRouter()
const { logout } = useAuth()
onMounted(() => {
  logout()
  router.replace('/login')
})
</script>

<template>
  <div class="p-6 text-gray-700 dark:text-gray-200">Signing out…</div>
</template>

