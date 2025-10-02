<template>
  <div class="property-container">
    <div class="search-card">
      <h2 class="title-sm">Недвижимость</h2>
      <form class="search-form" @submit.prevent="createProperty">
        <input class="search-input" v-model="newTitle" placeholder="Название (например, Дом, Ленина 5)" />
        <input class="search-input" v-model="newAddress" placeholder="Адрес" />
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
            <th>Адрес</th>
            <th>Создано</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in items" :key="p.id">
            <td>{{ p.id }}</td>
            <td>
              <router-link :to="{ name: 'property-detail', params: { id: p.id } }">
                {{ p.title }}
              </router-link>
            </td>
            <td>{{ p.address }}</td>
            <td>{{ new Date(p.created_at).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Property } from '@/types'
import { apiFetch } from '@/api/client'

const items = ref<Property[]>([])
const error = ref('')
const newTitle = ref('')
const newAddress = ref('')

const load = async () => {
  try {
    items.value = await apiFetch<Property[]>('/api/properties/')
  } catch (e: any) {
    error.value = e.message
  }
}

const createProperty = async () => {
  if (!newTitle.value.trim()) return
  try {
    const p = await apiFetch<Property>('/api/properties/', {
      method: 'POST',
      body: JSON.stringify({ title: newTitle.value, address: newAddress.value })
    })
    items.value.unshift(p)
    newTitle.value = ''
    newAddress.value = ''
  } catch (e: any) {
    error.value = e.message.includes('403') ? 'Недостаточно прав' : e.message
  }
}

onMounted(load)
</script>

<style scoped>
.property-container {
  max-width: 1000px;
  /* как у списка пользователей */
  margin: 2rem auto;
  padding-left: 2rem;
  /* сдвигает блок вправо */
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

.results-table a {
  color: #007BFF;
  text-decoration: none;
}

.results-table a:hover {
  text-decoration: underline;
}
</style>
