import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import toast from 'react-hot-toast'

export function useBudgets(month: number, year: number) {
  return useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => api.get('/budgets', { params: { month, year } }).then(r => r.data),
  })
}

export function useBudgetOverview(month: number, year: number) {
  return useQuery({
    queryKey: ['budget-overview', month, year],
    queryFn: () => api.get('/budgets/overview', { params: { month, year } }).then(r => r.data),
  })
}

export function useUpsertBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/budgets', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); qc.invalidateQueries({ queryKey: ['budget-overview'] }); toast.success('Төсөв хадгалагдлаа') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Алдаа гарлаа'),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); qc.invalidateQueries({ queryKey: ['budget-overview'] }); toast.success('Төсөв устгагдлаа') },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Алдаа гарлаа'),
  })
}
