<template>
  <div v-if="modelValue" class="overlay" @click.self="close">
    <div class="card modal">
      <header class="row" style="justify-content:space-between;align-items:center;">
        <h3>История объекта #{{ propertyId }}</h3>
        <button class="btn outline" @click="close">Закрыть</button>
      </header>
      <div v-if="error" class="err">{{ error }}</div>
      <div v-if="loading && items.length === 0" class="muted">Загрузка…</div>
      <ul class="timeline" v-if="items.length">
        <li v-for="it in items" :key="it.id" class="tl-item">
          <div class="tl-dot"></div>
          <div class="tl-content">
            <div class="row" style="justify-content:space-between; align-items:center;">
              <div>
                <span class="badge" :class="'ev-' + it.event">{{ labelEvent(it.event) }}</span>
                <small class="muted" style="margin-left:.5rem">{{ formatDate(it.created_at) }}</small>
              </div>
              <small class="muted">{{ it.actor_username || '—' }}</small>
            </div>
            <table class="table mini" v-if="it.changes && it.changes.length">
              <thead>
                <tr>
                  <th>Поле</th>
                  <th>Было</th>
                  <th>Стало</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(chg, idx) in it.changes" :key="idx">
                  <td>{{ labelField(chg.field) }}</td>
                  <td>{{ formatVal(chg.old) }}</td>
                  <td>{{ formatVal(chg.new) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-if="it.note" class="note">{{ it.note }}</p>
          </div>
        </li>
      </ul>
      <div class="row" style="justify-content:center; margin-top:.75rem;">
        <button class="btn" v-if="hasMore && !loading" @click="loadMore">Показать ещё</button>
        <div class="spinner" v-if="loading && items.length > 0"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { apiFetch } from '@/api/client'
import type { HistoryEntry, HistoryList } from '@/types'


const props = defineProps<{ modelValue: boolean, propertyId: number | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()


const items = ref<HistoryEntry[]>([])
const error = ref('')
const loading = ref(false)
const limit = 20
let offset = 0
const hasMore = ref(false)

const close = () => { emit('update:modelValue', false) }

watch(() => props.modelValue, (v) => { if (v) refresh() })

watch(() => props.propertyId, () => { if (props.modelValue) refresh() })

const refresh = async () => {
  if (!props.propertyId) return
  items.value = []
  offset = 0
  hasMore.value = false
  error.value = ''
  await loadMore()
}

const loadMore = async () => {
  if (!props.propertyId) return
  loading.value = true
  try {
    const data = await apiFetch<HistoryList>(`/api/properties/${props.propertyId}/history/?limit=${limit}&offset=${offset}`)
    items.value.push(...(data.items || []))
    hasMore.value = (data.items || []).length === limit
    offset += (data.items || []).length
  } catch (e: any) {
    error.value = e.message
  } finally { loading.value = false }
}

const labelEvent = (e: string) => {
  switch (e) {
    case 'created': return 'Создано'
    case 'updated': return 'Изменено'
    case 'deleted': return 'Удалено'
    default: return e
  }
}

const labelField = (f: string) => {
  const map: Record<string, string> = { title: 'Название', address: 'Адрес', description: 'Описание' }
  return map[f] || f
}

const formatVal = (v: unknown) => { if (v == null || v === '') return '—'; return String(v) }

const formatDate = (iso: string) => { try { return new Date(iso).toLocaleString() } catch { return iso } }
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .35);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 1000;
}

.modal {
  width: min(900px, 96vw);
  max-height: 90vh;
  overflow: auto;
}

.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.tl-item {
  position: relative;
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.tl-item .tl-dot {
  position: absolute;
  left: .3rem;
  top: .45rem;
  width: .6rem;
  height: .6rem;
  background: var(--c);
  border-radius: 50%;
}

.tl-content {
  background: #fff;
  border: 1px solid #eee;
  border-radius: .5rem;
  padding: .6rem .8rem;
}

.table.mini th,
.table.mini td {
  font-size: .9rem;
}

.err {
  color: #b91c1c;
  margin: .5rem 0;
}

.note {
  background: #fff8e1;
  border: 1px solid #fde68a;
  padding: .4rem .6rem;
  border-radius: .4rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--c);
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg)
  }
}
</style>
