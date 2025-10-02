<template>
  <div class="search-page">
    <div class="search-card">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>Создать пользователя</h2>
        <router-link class="search-btn btn-danger" to="/">На главную</router-link>
      </div>
      <div v-if="loading" class="info-text">Загрузка...</div>
      <div v-if="!loading && !canCreate" class="warning-text">
        У вас нет права <code>auth.add_user</code>. Обратитесь к администратору.
      </div>
      <form v-if="!loading && canCreate" @submit.prevent="submit" class="search-form">
        <div class="form-group" v-for="field in formFields" :key="field.key">
          <label>{{ field.label }}</label>
          <input v-if="field.type !== 'checkbox'" class="search-input" v-model="form[field.key]"
            :type="field.type || 'text'" :placeholder="field.placeholder" :required="field.required"
            :minlength="field.minlength" />
          <div v-else class="checkbox-group">
            <input type="checkbox" v-model="form[field.key]" />
            <span>Доступ к админке</span>
          </div>
        </div>
        <div class="form-group roles-group">
          <h5>Права доступа</h5>
          <div class="checkbox-group" v-for="role in roleOptions" :key="role.value">
            <input type="checkbox" :value="role.value" v-model="form.roles" />
            <span>{{ role.text }}</span>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="search-btn btn-success" :disabled="!valid || saving">

            <span v-if="saving">Создание...</span>
            <span v-else>Создать</span>
          </button>
          <button type="button" class="search-btn btn-secondary text-white" @click="reset">Сбросить</button>
        </div>
        <div v-if="error" class="error-text">{{ error }}</div>
        <div v-if="okMsg" class="ok-text">{{ okMsg }}</div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { createUser } from "@/api/client";
import { CreateUserPayload, RoleItem, Roles } from "@/types";
import { storeToRefs } from "pinia";

const auth = useAuthStore();
const { user } = storeToRefs(auth);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  await auth.getUserSession();
  loading.value = false;
});

const canCreate = computed(() =>
  user.value?.role === Roles.ADMIN ||
  user.value?.permissions?.includes("auth.add_user")
);

const allRoles = computed<RoleItem[]>(() => [
  { code: Roles.ADMIN, label: "Администратор (все права)" },
  { code: Roles.MANAGER, label: "Менеджер" },
  { code: Roles.USER, label: "Пользователь" },
]);

const roleOptions = computed(() =>
  allRoles.value.map((r) => ({ value: r.code, text: r.label }))
);

const form = reactive<CreateUserPayload>({
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  username: "",
  is_staff: false,
  roles: [],
});

const saving = ref(false);
const error = ref("");
const okMsg = ref("");

const valid = computed(
  () =>
    !!form.email &&
    !!form.first_name &&
    !!form.last_name &&
    !!form.password &&
    form.password.length >= 8
);

const reset = () => {
  form.email = "";
  form.first_name = "";
  form.last_name = "";
  form.password = "";
  form.username = "";
  form.is_staff = false;
  form.roles = [];
  error.value = "";
  okMsg.value = "";
};

const submit = async () => {
  if (!valid.value) return;
  saving.value = true;
  error.value = "";
  okMsg.value = "";

  try {
    const payload: CreateUserPayload = {
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      password: form.password,
      username: form.username || undefined,
      is_staff: form.is_staff,
      role: form.roles[0] || Roles.USER,
    };
    const user = await createUser(payload);
    okMsg.value = `Пользователь создан: ${user.username} (id=${user.id})`;
    reset();
  } catch (e: any) {
    error.value = e?.message || "Ошибка создания пользователя";
  } finally {
    saving.value = false;
  }
};

const formFields = [
  { label: "Email *", key: "email", type: "email", required: true },
  { label: "Username (опционально)", key: "username", placeholder: "если пусто — сгенерируется" },
  { label: "Имя *", key: "first_name", required: true },
  { label: "Фамилия *", key: "last_name", required: true },
  { label: "Пароль *", key: "password", type: "password", minlength: 8, required: true },
  { label: "Доступ к админке (is_staff)", key: "is_staff", type: "checkbox" },
];
</script>

<style scoped>
.search-btn {
  text-decoration: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-success:hover {
  background-color: #218838;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover {
  background-color: #c82333;
  color: white;
}

.search-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  max-width: 650px;
  margin: auto;
  font-family: Arial, sans-serif;
}

.search-card h2 {
  font-size: 1.4rem;
  font-weight: 600;
}

h2 {
  margin-bottom: 1rem;
  color: #333;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.3rem;
}

.search-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 0.3rem;
  font-size: 0.95rem;
  width: 100%;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.roles-group h5 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.search-btn {
  padding: 0.3rem 0.8rem;
  font-size: 0.9rem;
  border: none;
  border-radius: 0.3rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.search-btn.btn-secondary {
  background-color: #6c757d;
}

.search-btn:hover {
  opacity: 0.9;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.error-text {
  color: #b91c1c;
}

.ok-text {
  color: #28a745;
}

.info-text {
  color: #17a2b8;
}

.warning-text {
  color: #856404;
}
</style>
