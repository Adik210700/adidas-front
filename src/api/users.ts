import { apiFetch } from '@/api/client'
import type { IUserListResponse, IUser } from '../types'


export const fetchUsers = (page = 1, pageSize = 10): Promise<IUserListResponse> => {
  return apiFetch<IUserListResponse>(`/api/admin/users/?page=${page}&page_size=${pageSize}`)
}


export const fetchUserById = (id: number): Promise<IUser> => {
  return apiFetch<IUser>(`/api/admin/users/${id}/`)
}




export const updateUserById = async(id: number, data: any) => {
    const response = await apiFetch(`/api/admin/users/${id}/`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    })
    return response
}

const API_URL = '/api/admin/users'


export const deleteUserById = async (id: number): Promise<void> => {
  await apiFetch(`${API_URL}/${id}/`, {
    method: 'DELETE',
  })
}
