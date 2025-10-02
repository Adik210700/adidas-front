import { defineStore } from 'pinia'
import { fetchSession } from '../api/client' 
import { IUser } from '../types' 
import { computed, ref } from 'vue'

const read = (key: string): string | null =>
  localStorage.getItem(key) ?? sessionStorage.getItem(key)

const write = (key: string, val: string | null, remember = true) => {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
  if (val == null) return
  ;(remember ? localStorage : sessionStorage).setItem(key, val)
}

export const useAuthStore = defineStore('auth', () => {
  
  const access = ref(read('access'))
  const refresh = ref(read('refresh'))
  const user = ref<IUser | null>(null)
  const isAuth = computed(() => Boolean(access.value))

  const getUserSession = async () => {
    if (!access.value) return null
    try {
      const data = await fetchSession()
      user.value = data
      return data
    } catch (e) {
      console.error('Ошибка получения сессии', e)
      logout()
    }
  }

  const setTokens = (
    newAccess: string | null,
    newRefresh: string | null,
    remember = true
  ) => {
    access.value = newAccess
    refresh.value = newRefresh
    write('access', newAccess, remember)
    write('refresh', newRefresh, remember)
  }

  const setUser = (newUser: IUser | null, remember = true) => {
    user.value = newUser
    if (newUser) {
      (remember ? localStorage : sessionStorage).setItem(
        'user',
        JSON.stringify(newUser)
      )
    } else {
      localStorage.removeItem('user')
      sessionStorage.removeItem('user')
    }
  }

  const logout = () => {
    setTokens(null, null)
    setUser(null)
    user.value = null
    access.value = null
    refresh.value = null
    if (location.pathname !== '/login') {
      location.replace('/login')
    }
  }

  const storedUser = localStorage.getItem('user') ?? sessionStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch {
      user.value = null
    }
  } else if (access.value) {
    getUserSession()
  }

  return {
    isAuth,
    user,
    access,
    refresh,
    setTokens,
    setUser,
    logout,
    getUserSession,
  }
})
