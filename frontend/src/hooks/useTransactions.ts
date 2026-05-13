import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export const useTransactions = (params?: Record<string, any>) =>
  useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.get('/transactions', { params }).then(r => r.data),
  })

export const useTransactionSummary = (month: number, year: number) =>
  useQuery({
    queryKey: ['transactions-summary', month, year],
    queryFn: () => api.get('/transactions/summary', { params: { month, year } }).then(r => r.data),
  })

export const useCreateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/transactions', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transactions-summary'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export const useUpdateTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/transactions/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transactions-summary'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export const useDeleteTransaction = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transactions-summary'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
