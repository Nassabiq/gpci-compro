export default defineNuxtPlugin(() => {
  const { user, hydrateFromCookie } = useAuth()
  if (!user.value) hydrateFromCookie()
})

