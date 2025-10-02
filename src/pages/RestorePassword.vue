<template>
    <div class="page-container">
        <div class="card">
            <h2>Восстановление пароля</h2>
            <form @submit.prevent="onSubmit">
                <label>
                    Новый пароль
                    <input type="password" v-model="password" required class="input" placeholder="Введите новый пароль"
                        autofocus />
                </label>
                <label>
                    Подтверждение пароля
                    <input type="password" v-model="confirmPassword" required class="input"
                        placeholder="Повторите пароль" />
                </label>
                <button type="submit" class="btn primary" :disabled="loading">
                    <span v-if="!loading">Сохранить</span>
                    <span v-else class="spinner"></span>
                </button>
                <p v-if="error" class="err">{{ error }}</p>
                <p v-if="success" class="success">Пароль успешно изменён!</p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api/client'

const route = useRoute()
const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const token = route.query.activate as string || ''

if (!token) {
    error.value = 'Токен активации не найден'
}

/**
 * Обработчик отправки формы восстановления пароля.
 *
 * 1. Проверяет наличие токена активации.
 * 2. Сравнивает введённые пароли (основной и подтверждение).
 * 3. Отправляет запрос на API для восстановления пароля.
 * 4. В случае успеха показывает сообщение и перенаправляет на страницу логина.
 * 5. В случае ошибки отображает сообщение об ошибке.
 *
 * @async
 * @function onSubmit
 * @returns {Promise<void>} Промис без возвращаемого значения.
 */
const onSubmit = async () => {
    if (!token) {
        error.value = 'Токен активации отсутствует'
        return
    }

    if (password.value !== confirmPassword.value) {
        error.value = 'Пароли не совпадают'
        return
    }

    loading.value = true
    error.value = ''
    try {
        await apiFetch('/api/auth/restore_password/', {
            method: 'POST',
            body: JSON.stringify({
                token,
                password: password.value,
            }),
        })
        success.value = true
        setTimeout(() => router.push('/login'), 2000) // перенаправление на логин
    } catch (e: any) {
        error.value = e.message || 'Ошибка восстановления пароля'
    } finally {
        loading.value = false
    }
}
</script>

<style>
.page-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    background: #f3f4f6;
    padding: 2rem 1rem;
}

.card {
    background: #fff;
    padding: 2rem;
    border-radius: 12px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

h2 {
    text-align: center;
    margin-bottom: 1rem;
}

label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.input {
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 16px;
}

button.btn.primary {
    width: 100%;
    padding: 0.9rem;
    border: none;
    border-radius: 0.5rem;
    background: var(--c);
    color: var(--on-c);
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
}

button.btn.primary:hover {
    background: var(--c-600);
}

.err {
    color: #e74c3c;
    text-align: center;
}

.success {
    color: #27ae60;
    text-align: center;
}
</style>
