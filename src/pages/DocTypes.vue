<template>
  <div class="doc-types-container">
    <div class="search-card">
      <h2 class="title-sm">Типы документов</h2>
      <form class="search-form" @submit.prevent="createType">
        <input class="search-input" v-model="name" placeholder="Название" required />
        <input class="search-input" v-model="description" placeholder="Описание" />
        <button type="submit" class="search-btn btn-info">Добавить</button>
      </form>
      <p v-if="error" class="error-text">{{ error }}</p>
    </div>

    <div class="results-card">
      <table class="results-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in items" :key="t.id">
            <td>{{ t.id }}</td>
            <td>{{ t.name }}</td>
            <td>{{ t.description }}</td>
            <td>
              <button class="search-btn btn-danger" @click="removeType(t.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { DocType } from '@/types'
import { apiFetch } from '@/api/client'

const items = ref<DocType[]>([])
const name = ref('')
const description = ref('')
const error = ref('')

const load = async () => {
  try {
    items.value = await apiFetch<DocType[]>('/api/doc-types/')
  } catch (e: any) {
    error.value = e.message
  }
}

const createType = async () => {
  try {
    const t = await apiFetch<DocType>('/api/doc-types/', {
      method: 'POST',
      body: JSON.stringify({ name: name.value, description: description.value })
    })
    items.value.unshift(t)
    name.value = ''
    description.value = ''
  } catch (e: any) {
    error.value = e.message.includes('403') ? 'Недостаточно прав' : e.message
  }
}

const removeType = async (id: number) => {
  if (!confirm('Удалить тип документа?')) return
  try {
    await apiFetch<void>(`/api/doc-types/${id}/`, { method: 'DELETE' })
    items.value = items.value.filter(x => x.id !== id)
  } catch (e: any) {
    alert(e.message.includes('403') ? 'Нет права удалять' : e.message)
  }
}

onMounted(load)
</script>

<style scoped>
.doc-types-container {
  max-width: 1000px;
  /* как у списка пользователей */
  margin: 2rem auto;
  padding-left: 2rem;
  /* сдвиг вправо */
  padding-right: 0;
}

.search-card,
.results-card {
  background: #fff;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.title-sm {
  font-size: 1.4rem;
  font-weight: bold;
  text-align: left;
  /* заголовок слева */
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  min-width: 150px;
  padding: 0.3rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.3rem;
  font-size: 0.95rem;
}

.search-btn {
  padding: 0.3rem 0.8rem;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s ease;
}

.search-btn:hover {
  background-color: #138496;
}

.btn-danger {
  background-color: #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
}

.error-text {
  color: #b91c1c;
  margin-top: 0.5rem;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th,
.results-table td {
  padding: 0.6rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.results-table th {
  background-color: #f8f9fa;
}

.results-table tr:hover {
  background-color: #f1f1f1;
}
</style>
