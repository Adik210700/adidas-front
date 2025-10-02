<template>
  <div class="search-container">
    <div class="search-card">
      <h2 class="title-sm">Поиск</h2>
      <form class="search-form" @submit.prevent="search">
        <input class="search-input" v-model="q" placeholder="Что ищем?" />
        <button type="submit" class="search-btn btn-info">
          Найти
        </button>
      </form>
    </div>

    <div class="results-card" v-if="props.length">
      <h3>Недвижимость ({{ props.length }})</h3>
      <ul class="results-list">
        <li v-for="p in props" :key="p.id">
          <router-link :to="{ name: 'property-detail', params: { id: p.id } }">{{ p.title }}</router-link>
        </li>
      </ul>
    </div>

    <div class="results-card" v-if="docs.length">
      <h3>Документы ({{ docs.length }})</h3>
      <div class="table-container">
        <table class="results-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Тип</th>
              <th>Название</th>
              <th>Объект</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in docs" :key="d.id">
              <td>{{ d.id }}</td>
              <td>{{ d.doc_type_name }}</td>
              <td>{{ d.name }}</td>
              <td>
                <router-link :to="{ name: 'property-detail', params: { id: d.property } }">перейти</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="!props.length && !docs.length && q" class="no-results">
      Результатов не найдено.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Property, PropertyDocument, SearchResponse } from '@/types'
import { apiFetch } from '@/api/client'

const q = ref('')
const props = ref<Property[]>([])
const docs = ref<PropertyDocument[]>([])

const search = async () => {
  const data = await apiFetch<SearchResponse>(`/api/search/?q=${encodeURIComponent(q.value)}`)
  props.value = data.properties || []
  docs.value = data.documents || []
}
</script>

<style scoped>
.search-container {
  max-width: 1000px;
  /* как у списка пользователей */
  margin: 2rem auto;
  padding-left: 2rem;
  /* сдвиг вправо */
  padding-right: 0;
}

.title-sm {
  font-size: 1.4rem;
  font-weight: bold;
  text-align: left;
  /* заголовок слева */
}

.search-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  font-family: Arial, sans-serif;
}

.search-card,
.results-card {
  background: #fff;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h2,
h3 {
  margin-bottom: 1rem;
  color: #333;
}

.search-form {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.3rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.3rem;
  font-size: 0.9rem;
}

.search-btn {
  padding: 0.3rem 0.8rem;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 0.3rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s ease;
}

.search-btn:hover {
  background-color: #138496;
}

.results-list {
  list-style: none;
  padding: 0;
}

.results-list li {
  padding: 0.4rem 0;
}

.results-list a {
  color: #007BFF;
  text-decoration: none;
}

.results-list a:hover {
  text-decoration: underline;
}

.table-container {
  overflow-x: auto;
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

.no-results {
  text-align: center;
  color: #888;
  font-style: italic;
  margin-top: 1rem;
}
</style>
