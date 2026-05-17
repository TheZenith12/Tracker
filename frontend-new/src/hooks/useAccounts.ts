import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'

export function useAccounts() {
  return useQuery({ queryKey: ['accounts'], queryFn: () => api.get('/accounts').then(r => r.data) })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/accounts', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Данс үүслээ') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Алдаа гарлаа'),
  })
}

export function useUpdateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/accounts/${id}`, data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Хадгалагдлаа') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Алдаа гарлаа'),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); toast.success('Данс устгагдлаа') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Алдаа гарлаа'),
  })
}
