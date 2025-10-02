<template>
    <b-container class="mt-4">
        <h2 class="mb-4 title-sm">Информация о пользователе</h2>

        <b-card v-if="userData" class="p-3">
            <b-row class="mb-2">
                <b-col cols="3"><strong>ID:</strong></b-col>
                <b-col>{{ userData.id }}</b-col>
            </b-row>

            <b-row class="mb-2">
                <b-col cols="3"><strong>Имя:</strong></b-col>
                <b-col>
                    <span v-if="!isEditing">{{ userData.first_name }}</span>
                    <b-form-input v-else v-model="editData.first_name" />
                </b-col>
            </b-row>

            <b-row class="mb-2">
                <b-col cols="3"><strong>Фамилия:</strong></b-col>
                <b-col>
                    <span v-if="!isEditing">{{ userData.last_name }}</span>
                    <b-form-input v-else v-model="editData.last_name" />
                </b-col>
            </b-row>

            <b-row class="mb-2">
                <b-col cols="3"><strong>Email:</strong></b-col>
                <b-col>
                    <span v-if="!isEditing">{{ userData.email }}</span>
                    <b-form-input v-else v-model="editData.email" />
                </b-col>
            </b-row>

            <b-row class="mb-2">
                <b-col cols="3"><strong>Роль:</strong></b-col>
                <b-col>
                    <span v-if="!isEditing">{{ translateRole(userData.role) }}</span>
                    <b-form-select v-else v-model="editData.role" :options="roleOptions" />
                </b-col>
            </b-row>

            <b-row class="mb-2">
                <b-col cols="3"><strong>Дата создания:</strong></b-col>
                <b-col>{{ userData.date_joined }}</b-col>
            </b-row>

            <b-row class="mb-2">
                <b-col cols="3"><strong>Активен:</strong></b-col>
                <b-col>{{ userData.is_active ? "Да" : "Нет" }}</b-col>
            </b-row>

            <div class="mt-4 d-flex justify-content-between align-items-center">
                <!-- Кнопка назад слева -->
                <router-link to="/user/list" class="btn-fixed btn-light-custom btn-rounded-custom back-btn btn-small"
                    role="button">
                    Назад к списку
                </router-link>
                <div class="d-flex gap-2">
                    <b-button v-if="!isEditing" size="sm"
                        class="btn-fixed btn-warning-custom btn-rounded-custom btn-small" @click="isEditing = true">
                        Редактировать
                    </b-button>
                    <b-button v-if="!isEditing" size="sm"
                        class="btn-fixed btn-danger-custom btn-rounded-custom btn-small" @click="deleteUser">
                        Удалить
                    </b-button>
                    <b-button v-if="isEditing" variant="success" size="sm"
                        class="btn-fixed btn-small btn-rounded-custom" @click="saveUser">
                        Сохранить
                    </b-button>
                    <b-button v-if="isEditing" size="sm"
                        class="btn-fixed btn-secondary-custom btn-small btn-rounded-custom" @click="cancelEdit">
                        Отмена
                    </b-button>
                </div>
            </div>
        </b-card>
        <div v-else class="text-center">
            <b-spinner label="Загрузка..." />
        </div>
    </b-container>
</template>


<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchUserById, updateUserById } from '@/api/users'
import { useRouter } from 'vue-router'
import { deleteUserById } from '@/api/users'

const route = useRoute()
const userId = Number(route.params.id)
const userData = ref<any>(null)
const isEditing = ref(false)
const editData = ref<any>({})
const router = useRouter()

const userRoleTranslations = {
    user: "Пользователь",
    manager: "Менеджер",
    admin: "Администратор"
}
const roleOptions = [
    { value: "user", text: "Пользователь" },
    { value: "manager", text: "Менеджер" },
    { value: "admin", text: "Администратор" }
]

const translateRole = (role: string) => {
    return userRoleTranslations[role] || role
}

const loadUser = async () => {
    try {
        userData.value = await fetchUserById(userId)
        editData.value = { ...userData.value }
    } catch (err) {
        console.error("Ошибка загрузки пользователя:", err)
    }
}

const saveUser = async () => {
    try {
        await updateUserById(userId, editData.value)
        await loadUser()
        isEditing.value = false
    } catch (err) {
        console.error("Ошибка при сохранении пользователя:", err)
    }
}

const cancelEdit = () => {
    isEditing.value = false
    editData.value = { ...userData.value }
}

const deleteUser = () => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;
    deleteUserById(userId).then(() => router.push("/user/list"))
        .catch(err => {
            console.error("Ошибка при удалении пользователя:", err);
            alert("Не удалось удалить пользователя");
        });
};

onMounted(loadUser)
</script>

<style>
.title {
    font-size: 1.8rem;
    font-weight: bold;
}

.btn-light.back-btn {
    background: #f8f9fa !important;
    color: #000 !important;
    border: 1px solid #ced4da !important;
}

.btn-secondary-custom:hover {
    background: #556174;
    border-color: #556174;
}

.btn-warning-custom {
    background: #fbbf24;
    color: #000;
    border: 1px solid #fbbf24;
    padding: 0.5rem 0.8rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.btn-warning-custom:hover {
    background: #f59e0b;
    border-color: #f59e0b;
}

.btn-rounded-custom {
    padding: 0.5rem 0.8rem;
    border-radius: 0.3rem;
}

.btn-light-custom {
    background: #f8f9fa;
    color: #000;
    border: 1px solid #ced4da;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.btn-light-custom:hover {
    background: #e9ecef;
}

.btn-danger-custom {
    background: #ef4444;
    color: #fff;
    border: 1px solid #ef4444;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

.btn-danger-custom:hover {
    background: #dc2626;
    border-color: #dc2626;
}

.btn-light-custom.back-btn {
    text-decoration: none !important;
}

.btn-same {
    display: inline-block;
    padding: 0.5rem 0.8rem;
    font-size: 0.875rem;
    border-radius: 0.5rem;
    text-align: center;
    cursor: pointer;
}

.btn-small {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
}
</style>