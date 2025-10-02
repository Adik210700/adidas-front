<template>
  <div class="nav">
    <div class="wrap">
      <img src="../assets/logo.svg" style="width: 200px" />
      <template v-if="isAuth">
        <router-link to="/">Недвижимость</router-link>
        <router-link to="/doc-types">Типы документов</router-link>
        <router-link to="/search">Поиск</router-link>
        <router-link v-if="user?.role === Roles.ADMIN" to="/user/list" class="btnUserList">
          Список пользователей
        </router-link>
      </template>
      <div class="spacer"></div>
      <template v-if="isAuth">
        <span class="badge">{{ user.username }}</span>
        <button class="btn btn-logout" @click="logout">Выйти</button>
      </template>
      <template v-else-if="route.name !== 'login'">
        <router-link to="/login">
          <strong class="login-link">Войти</strong>
        </router-link>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { Roles } from '../types'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const { isAuth, user } = storeToRefs(auth)

const logout = () => {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<style>
.login-link:hover {
  text-decoration: underline;
}

.btn-logout {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  background: #e53935;
  color: #fff;
  border: none;
  cursor: pointer;
}

.btn-logout:hover {
  background: #e53935;
}
.badge {
  background-color: #f44336;
  /* мягкий красный */
  color: #ffffff;
  /* белый текст */
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 400;
  /* обычный вес текста */
  text-transform: none;
}
</style>
