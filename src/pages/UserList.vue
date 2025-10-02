<template>
    <div class="container no-padding">
        <b-row class="align-items-center mb-3 no-gutters justify-content-between">
            <b-col cols="auto" class="p-0">
                <h2 class="title-sm">Список пользователей - {{ count }}</h2>
            </b-col>
            <b-col cols="auto" class="p-0 text-end">
                <router-link v-if="user?.role === Roles.ADMIN" to="/users/new" class="btn btn-sm btn-create-user">
                    Создать пользователя
                </router-link>
            </b-col>
        </b-row>

        <b-table striped hover :items="users" :fields="fields" responsive small class="floating-table compact-table">
            <template #cell(role)="data">
                {{ translateRole(data.item.role) || '-' }}
            </template>

            <template #cell(actions)="data">
                <router-link :to="`/users/${data.item.id}`" class="btn btn-sm btn-light-custom">
                    Подробнее
                </router-link>
            </template>
        </b-table>

        <b-pagination v-if="count > pageSize" v-model="page" :total-rows="count" :per-page="pageSize" align="center"
            @change="changePage" class="mt-3"></b-pagination>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchUsers } from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import type { IUser } from '../types'
import { Roles } from '../types'

const users = ref<IUser[]>([])
const count = ref(0)
const page = ref(1)
const pageSize = 10
const auth = useAuthStore()
const { user } = storeToRefs(auth)

const userRoleTranslations = {
    [Roles.USER]: "Пользователь",
    [Roles.MANAGER]: "Менеджер",
    [Roles.ADMIN]: "Администратор"
}

const translateRole = (role: Roles) => {
    return userRoleTranslations[role] || role
}

const fields = [
    { key: 'first_name', label: 'Имя' },
    { key: 'last_name', label: 'Фамилия' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Роль' },
    { key: 'actions', label: 'Действия' }
]

const loadUsers = async () => {
    try {
        const data = await fetchUsers(page.value, pageSize)
        users.value = data.results
        count.value = data.count
    } catch (err) {
        console.error('Ошибка при загрузке пользователей', err)
    }
}

const changePage = (newPage: number) => {
    page.value = newPage
    loadUsers()
}

onMounted(loadUsers)
</script>

<style>
.container.no-padding {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 0;
}

.b-row.no-gutters {
    margin-left: 0 !important;
    margin-right: 0 !important;
}

.b-col.p-0 {
    padding-left: 0 !important;
    padding-right: 0 !important;
}

.title-sm {
    margin-left: 0 !important;
    font-size: 1.4rem;
    font-weight: bold;
}

.floating-table {
    border-radius: 0.3rem;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.btn-light-custom {
    background: #f8f9fa;
    color: #000;
    border: 1px solid #ced4da;
    padding: 0.1rem 0.5rem;
    border-radius: 0.2rem;
    text-decoration: none;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.btn-light-custom:hover {
    background: #e9ecef;
    border-color: #adb5bd;
}

.btn-create-user {
    padding: 0.25rem 0.5rem;
    font-size: 0.85rem;
    background-color: #ef4444;
    color: #fff;
    border: 1px solid #ef4444;
    border-radius: 0.25rem;
    text-decoration: none;
    transition: none;
}

.btn-create-user:hover {
    background-color: #ef4444;
    border-color: #ef4444;
    color: #fff;
}

</style>
