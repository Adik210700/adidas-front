export interface DocType {
  id: number
  name: string
  description?: string | null
}

export interface Property {
  id: number
  title: string
  address?: string
  description?: string
  created_at: string
}

export interface PropertyDocument {
  id: number
  property: number
  doc_type: number
  doc_type_name?: string
  name: string
  number?: string
  issued_at?: string | null
  file?: string | null
  notes?: string
  created_at: string
  status?: string
}

export interface SearchResponse {
  q: string
  properties: Property[]
  documents: PropertyDocument[]
}

export type HistoryEvent = 'created' | 'updated' | 'status_changed' | 'file_replaced' | 'deleted'

export interface HistoryChange {
  field: string
  old: unknown
  new: unknown
}

export interface HistoryEntry {
  id: number
  document: number
  version: number
  event: HistoryEvent
  changes: HistoryChange[]
  actor_id: number | null
  actor_username: string | null
  created_at: string
  note?: string
}

export interface HistoryList {
  items: HistoryEntry[]
}

export enum Roles {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

export interface IUserListResponse {
  count: number
  next: string | null
  previous: string | null
  results: IUser[]
}

 export interface IUser {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string

}

export interface RoleItem {
  code: Roles
  label: string
}

export interface CreateUserPayload {
  email: string
  first_name: string
  last_name: string
  password: string
  username?: string
  is_staff?: boolean
  permissions?: string[]
}
