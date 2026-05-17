import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'

export function useTransactions(params?: any) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.get('/transactions', { params }).then(r => r.data),
  })
}

export function useTransactionSummary(month: number, year: number) {
  return useQuery({
    queryKey: ['transactions-summary', month, year],
    queryFn: () => api.get('/transactions/summary', { params: { month, year } }).then(r => r.data),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/transactions', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transactions-summary'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Гүйлгээ нэмэгдлээ')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Алдаа гарлаа'),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/transactions/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transactions-summary'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Хадгалагдлаа')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Алдаа гарлаа'),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transactions-summary'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Устгагдлаа')
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Алдаа гарлаа'),
  })
}
