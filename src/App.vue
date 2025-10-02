<template>
  <div>
    <template v-if="inited">
      <NavBar />
      <main class="container">
        <router-view />
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { useAuthStore } from '@/stores/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const inited = ref(false)

/**
 * Выполняет проверку сессии пользователя при загрузке приложения.
 *
 * Логика:
 * 1. Вызывает `auth.getUserSession()` для получения данных о текущем пользователе.
 * 2. Устанавливает `inited.value = true` после завершения проверки.
 * 3. Если текущий путь не относится к публичным страницам (`/login`, `/restore_password`),
 *    повторно проверяет сессию пользователя.
 * 4. Если пользователь не авторизован — выполняет `auth.logout()` и перенаправляет на страницу входа.
 */
auth.getUserSession().finally(() => {
  inited.value = true

  const publicPaths = ['/login', '/restore_password']

  if (!publicPaths.includes(router.currentRoute.value.path)) {
    auth.getUserSession().finally(() => {
      inited.value = true

      if (!auth.isAuth) {
        console.log('Not authenticated, logging out')
        auth.logout()
      }
    })
  } else {
    inited.value = true
  }
})
</script>



























