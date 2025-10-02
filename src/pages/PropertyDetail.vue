<template>
  <div class="col" style="gap:1rem;">
    <div class="card">
      <div class="row" style="justify-content:space-between; align-items:flex-start;">
        <div class="col">
          <template v-if="!editMode">
            <h2>{{ property?.title }}</h2>
            <p v-if="property?.address"><strong>Адрес:</strong> {{ property?.address }}</p>
            <p v-if="property?.description">{{ property?.description }}</p>
          </template>
          <template v-else>
            <h3>Редактирование объекта</h3>
            <div class="col">
              <label>
                <span>Название</span>
                <input class="input" v-model.trim="editTitle" required />
              </label>
              <label>
                <span>Адрес</span>
                <input class="input" v-model.trim="editAddress" />
              </label>
              <label>
                <span>Описание</span>
                <textarea class="input" rows="3" v-model.trim="editDescription"></textarea>
              </label>
              <label>
                <span>Причина изменения (необязательно)</span>
                <input class="input" v-model.trim="editReason" placeholder="например: уточнение адреса" />
              </label>
              <div class="row" style="gap:.5rem;">
                <button class="btn" :disabled="saving || !canSave" @click="saveEdit">
                  <span v-if="!saving">Сохранить</span>
                  <span v-else class="spinner"></span>
                </button>
                <button class="btn secondary" :disabled="saving" @click="cancelEdit">Отмена</button>
              </div>
              <p v-if="editError" class="err">{{ editError }}</p>
            </div>
          </template>
        </div>
        <div class="row" style="gap:.5rem;">
          <button class="btn outline" @click="openPropertyHistory">История объекта</button>
          <button class="btn" v-if="!editMode" @click="startEdit">Редактировать</button>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>Добавить документ</h3>
      <form class="col" @submit.prevent="createDocument">
        <div class="row">
          <select v-model.number="docTypeId" class="input" required>
            <option disabled value="">Тип документа</option>
            <option v-for="t in docTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
          <input class="input" v-model="docName" placeholder="Название" required />
          <input class="input" v-model="docNumber" placeholder="Номер" />
        </div>
        <div class="row">
          <input class="input" type="date" v-model="docIssuedAt" />
          <input class="input" type="file" ref="fileInput" />
          <button class="btn">Создать</button>
        </div>
      </form>
      <p v-if="error" style="color:#b91c1c">{{ error }}</p>
    </div>
    <div class="card">
      <h3>Документы</h3>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Тип</th>
            <th>Название</th>
            <th>Статус</th>
            <th>Файл</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in docs" :key="d.id">
            <td>{{ d.id }}</td>
            <td>{{ d.doc_type_name }}</td>
            <td>{{ d.name }}</td>
            <td><span class="badge">{{ d.status || 'active' }}</span></td>
            <td>
              <span v-if="d.file">есть</span>
              <span v-else>—</span>
            </td>
            <td class="row">
              <button class="btn" @click="downloadPDF(d.id)">PDF</button>
              <button class="btn secondary" @click="downloadOriginal(d.id)" :disabled="!d.file">Оригинал</button>
              <button class="btn outline" @click="openHistory(d.id)">История</button>
              <button class="btn" @click="openStatus(d)">Статус</button>
              <label class="btn secondary">
                Заменить<input type="file" @change="(e) => replaceFile(d.id, e)" style="display:none">
              </label>
              <button class="btn danger" @click="removeDoc(d.id)">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <DocumentHistoryModal v-model="historyOpen" :doc-id="historyDocId" />
    <PropertyHistoryModal v-model="propertyHistoryOpen" :property-id="id" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Property, PropertyDocument, DocType } from '@/types'
import { apiFetch, download } from '@/api/client'
import DocumentHistoryModal from '@/components/DocumentHistoryModal.vue'
import PropertyHistoryModal from '@/components/PropertyHistoryModal.vue'

const route = useRoute()
const id = Number(route.params.id)

const property = ref<Property | null>(null)
const docs = ref<PropertyDocument[]>([])
const docTypes = ref<DocType[]>([])
const error = ref('')

const editMode = ref(false)
const saving = ref(false)
const editTitle = ref('')
const editAddress = ref('')
const editDescription = ref('')
const editReason = ref('')
const editError = ref('')

const canSave = computed(() => !!editTitle.value.trim())

const startEdit = () => {
  if (!property.value) return
  editMode.value = true
  editTitle.value = property.value.title || ''
  editAddress.value = property.value.address || ''
  editDescription.value = property.value.description || ''
  editReason.value = ''
  editError.value = ''
}

const cancelEdit = () => {
  editMode.value = false
  editError.value = ''
}

const saveEdit = async () => {
  if (!canSave.value) return
  saving.value = true
  editError.value = ''
  try {
    const body: any = {
      title: editTitle.value,
      address: editAddress.value,
      description: editDescription.value,
    }
    if (editReason.value.trim()) body.change_reason = editReason.value.trim()


    const updated = await apiFetch<Property>(`/api/properties/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    })
    property.value = updated
    editMode.value = false
  } catch (e: any) {
    editError.value = e.message.includes('403') ? 'Нет прав на изменение объекта' : (e.message || 'Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

const historyOpen = ref(false)
const historyDocId = ref<number | null>(null)
const propertyHistoryOpen = ref(false)

const openHistory = (docId: number) => { historyDocId.value = docId; historyOpen.value = true }

const openPropertyHistory = () => { propertyHistoryOpen.value = true }


const docTypeId = ref<number | ''>('' as any)
const docName = ref('')
const docNumber = ref('')
const docIssuedAt = ref<string>('')
const fileInput = ref<HTMLInputElement | null>(null)

const load = async () => {
  try {
    property.value = await apiFetch<Property>(`/api/properties/${id}/`)
    const list = await apiFetch<PropertyDocument[]>(`/api/property-documents/?property=${id}`)
    docs.value = list
    docTypes.value = await apiFetch<DocType[]>('/api/doc-types/')
  } catch (e: any) { error.value = e.message }
}

const createDocument = async() => {
  try {
    const fd = new FormData()
    fd.append('property', String(id))
    fd.append('doc_type', String(docTypeId.value))
    fd.append('name', docName.value)
    if (docNumber.value) fd.append('number', docNumber.value)
    if (docIssuedAt.value) fd.append('issued_at', docIssuedAt.value)
    if (fileInput.value?.files?.[0]) fd.append('file', fileInput.value.files[0])

    const d = await apiFetch<PropertyDocument>('/api/property-documents/', { method: 'POST', body: fd })
    docs.value.unshift(d)

    docTypeId.value = '' as any
    docName.value = ''
    docNumber.value = ''
    docIssuedAt.value = ''
    if (fileInput.value) fileInput.value.value = ''
  } catch (e: any) {
    error.value = e.message.includes('403') ? 'Недостаточно прав' : e.message
  }
}

const downloadPDF = async(docId: number) => {
  try { await download(`/api/property-documents/${docId}/download_pdf/`, 'document.pdf') }
  catch (e: any) { alert(e.message.includes('403') ? 'Нет права на скачивание PDF' : e.message) }
}

const downloadOriginal = async (docId: number) => {
  try { await download(`/api/property-documents/${docId}/download_original/`, 'original') }
  catch (e: any) { alert(e.message.includes('403') ? 'Нет права на скачивание оригинала' : e.message) }
}

const openStatus = async (d: PropertyDocument) => {
  const val = prompt('Новый статус:', d.status || 'active')
  if (!val) return
  try {
    const res = await apiFetch<PropertyDocument>(`/api/property-documents/${d.id}/set_status/`, {
      method: 'POST',
      body: JSON.stringify({ status: val })
    })
    const idx = docs.value.findIndex(x => x.id === d.id)
    if (idx >= 0) docs.value[idx] = res
  } catch (e: any) {
    alert(e.message.includes('403') ? 'Нет права менять статус' : e.message)
  }
}

const replaceFile = async (docId: number, e: Event) => {
  const inp = e.target as HTMLInputElement
  const f = inp.files?.[0]
  if (!f) return
  try {
    const fd = new FormData(); fd.append('file', f)
    const res = await apiFetch<PropertyDocument>(`/api/property-documents/${docId}/replace_file/`, { method: 'POST', body: fd })
    const idx = docs.value.findIndex(x => x.id === docId)
    if (idx >= 0) docs.value[idx] = res
  } catch (e: any) {
    alert(e.message.includes('403') ? 'Нет права на замену файла' : e.message)
  } finally {
    inp.value = ''
  }
}

const removeDoc = async (docId: number) => {
  if (!confirm('Удалить документ?')) return
  try {
    await apiFetch<void>(`/api/property-documents/${docId}/`, { method: 'DELETE' })
    docs.value = docs.value.filter(x => x.id !== docId)
  } catch (e: any) {
    alert(e.message.includes('403') ? 'Нет права на удаление' : e.message)
  }
}

onMounted(load)
</script>
