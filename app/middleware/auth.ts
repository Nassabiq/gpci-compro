export default defineNuxtRouteMiddleware((to) => {
  const { user, hydrateFromCookie } = useAuth()
  if (!user.value) hydrateFromCookie()
  if (!user.value) {
    const redirect = encodeURIComponent(to.fullPath)
    return navigateTo(`/login?redirect=${redirect}`)
  }
})

