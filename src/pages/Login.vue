<template>
  <div class="login-wrap">
    <div class="card login-card">
      <h2 class="login-title">Вход в систему</h2>
      <p class="muted">Введите учётные данные</p>

      <form class="login-form" @submit.prevent="onSubmit">
        <label>
          Почта
          <input class="input" v-model.trim="email" placeholder="Почта" required autofocus
            @invalid="e => setValidationMessage(e, 'Заполните логин')" @input="e => setValidationMessage(e)" />
        </label>

        <label class="password-field">
          Пароль
          <div class="password-wrap">
            <input class="input" :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Пароль"
              required @invalid="e => setValidationMessage(e, 'Заполните пароль')" @input="e => setValidationMessage(e)"
              @keydown="onKey" @keyup="onKey" />
            <button type="button" class="toggle-btn" @click="showPassword = !showPassword" :aria-pressed="showPassword">
              {{ showPassword ? "Скрыть" : "Показать" }}
            </button>
          </div>
          <small v-if="capsOn" class="caps">Внимание: включён Caps Lock</small>
        </label>

        <div class="options-row">
          <label class="checkbox-label">
            <input type="checkbox" v-model="remember" />
            Запомнить меня
          </label>
          <a class="link" @click.prevent="onForgot">Забыли пароль?</a>
        </div>

        <button class="btn btn-danger" :disabled="loading">
          <span v-if="!loading">Войти</span>
          <span v-else class="spinner"></span>
        </button>

        <p v-if="error" class="err">{{ error }}</p>
      </form>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from "vue"
import { apiFetch } from "@/api/client"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const auth = useAuthStore()
const router = useRouter()

const email = ref("")
const password = ref("")
const remember = ref(true)
const showPassword = ref(false)
const loading = ref(false)
const error = ref("")
const capsOn = ref(false)

const setValidationMessage = (e: Event, message = "") => {
  const input = e.target as HTMLInputElement
  input.setCustomValidity(message)
}

const onKey = (e: KeyboardEvent) => {
  try {
    capsOn.value = e.getModifierState && e.getModifierState("CapsLock")
  } catch {
    capsOn.value = false
  }
}

const onSubmit = async (): Promise<void> => {
  if (!email.value || !password.value) return
  loading.value = true
  error.value = ""
  try {
    const data = await apiFetch<{ access: string; refresh: string; user: any }>(
      "/api/auth/login/",
      {
        method: "POST",
        body: JSON.stringify({ email: email.value, password: password.value }),
      }
    )
    auth.setTokens(data.access, data.refresh, remember.value)
    auth.setUser(data.user)
    await router.replace({ name: "properties" })
  } catch (e: any) {
    const msg = String(e.message || "")
    if (msg.includes("401")) error.value = "Неверный логин или пароль"
    else if (msg.includes("429")) error.value = "Слишком много попыток. Попробуйте позже."
    else error.value = msg || "Ошибка авторизации"
  } finally {
    loading.value = false
  }
}

const onForgot = () => {
  alert("Обратитесь к администратору для сброса пароля.")
}
</script>

<style scoped>
.login-wrap {
  display: grid;
  place-items: center;
  min-height: 100vh;
  background: #f4f7fa;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
}

.muted {
  font-size: 0.9rem;
  color: #6c757d;
  text-align: center;
  margin-bottom: 1.5rem;
}

.login-form label {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #17a2b8;
  outline: none;
}

.password-wrap {
  position: relative;
}

.toggle-btn {
  position: absolute;
  top: 50%;
  right: 0.6rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 0.9rem;
  color: #17a2b8;
  cursor: pointer;
}

.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.link {
  color: #17a2b8;
  font-size: 0.9rem;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.btn {
  width: 100%;
  padding: 0.7rem;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #ef4444;
  color: white;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #dc2626;
}

.err {
  color: #b91c1c;
  margin-top: 1rem;
  text-align: center;
}

.caps {
  color: #b45309;
  font-size: 0.85rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-right-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
