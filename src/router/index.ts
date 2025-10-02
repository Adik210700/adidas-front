import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/pages/Login.vue'
import PropertiesList from '@/pages/PropertiesList.vue'
import PropertyDetail from '@/pages/PropertyDetail.vue'
import DocTypes from '@/pages/DocTypes.vue'
import Search from '@/pages/Search.vue'
import UserCreate from '@/pages/UserCreate.vue'
import Forbidden from '@/pages/Forbidden.vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth'
import UserList from '@/pages/UserList.vue'
import UserDetails from '@/pages/UserDetails.vue'
import RestorePassword from '@/pages/RestorePassword.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: Login },
    { path: '/', name: 'properties', component: PropertiesList },
    { path: '/properties/:id', name: 'property-detail', component: PropertyDetail, props: true },
    { path: '/doc-types', name: 'doc-types', component: DocTypes },
    { path: '/search', name: 'search', component: Search },
    {path: '/users/new',name: 'user-create',component: UserCreate },
    { path: '/forbidden', name: 'forbidden-403', component: Forbidden },
    { path: '/user/list', name: 'user-list', component: UserList },
    { path: '/users/:id', name: 'user-details', component: UserDetails, props: true },
    { path: '/restore_paswword', name: 'restore-password', component: RestorePassword}


  ],
})

/**
 * Глобальный навигационный guard Vue Router.
 *
 * Проверяет состояние авторизации пользователя перед переходом на страницу.
 *
 * Логика:
 * 1. Разрешает доступ к публичным страницам (`login`, `restore-password`) без авторизации.
 * 2. Если пользователь не авторизован и пытается зайти на приватную страницу — перенаправляет на `login`.
 * 3. Если пользователь авторизован и пытается зайти на страницу `login` — перенаправляет на `properties`.
 * 4. В остальных случаях разрешает переход.
 *
 * @param {RouteLocationNormalized} to — объект маршрута, на который выполняется переход.
 * @returns {boolean | RouteLocationRaw} — true для разрешения перехода, или объект маршрута для перенаправления.
 */
router.beforeEach((to) => {
  const auth = useAuthStore()
  const { isAuth } = storeToRefs(auth)

  // Разрешаем доступ без авторизации для страницы логина и восстановления пароля
  const publicPages = ['login', 'restore-password']

  if (!isAuth.value && !publicPages.includes(to.name as string)) {
    return { name: 'login' }
  }

  // Если авторизован и идёт на логин — перенаправляем на главную
  if (isAuth.value && to.name === 'login') {
    return { name: 'properties' }
  }

  return true
})

export default router
