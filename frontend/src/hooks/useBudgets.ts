import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export const useBudgets = (month: number, year: number) =>
  useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => api.get('/budgets', { params: { month, year } }).then(r => r.data),
  })

export const useBudgetOverview = (month: number, year: number) =>
  useQuery({
    queryKey: ['budgets-overview', month, year],
    queryFn: () => api.get('/budgets/overview', { params: { month, year } }).then(r => r.data),
  })

export const useUpsertBudget = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => api.post('/budgets', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets'] }),
  })
}
