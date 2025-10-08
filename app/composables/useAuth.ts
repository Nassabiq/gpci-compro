import { users } from '@/data/users'

export function useAuth() {
  const currentUserId = useCookie<number | null>('uid', { sameSite: 'lax' })
  const user = useState<typeof users[number] | null>('auth:user', () => null)

  function hydrateFromCookie() {
    if (currentUserId.value) {
      const u = users.find(x => x.id === currentUserId.value)
      if (u) user.value = u
    }
  }

  function login(email: string, password: string): boolean {
    const u = users.find(x => x.email === email && x.password === password)
    if (u) {
      user.value = u
      currentUserId.value = u.id
      return true
    }
    return false
  }

  function logout() {
    user.value = null
    currentUserId.value = null
  }

  return { user, login, logout, hydrateFromCookie }
}

