import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

export function useMonthlyTrend(year: number) {
  return useQuery({
    queryKey: ['monthly-trend', year],
    queryFn: () => api.get('/reports/monthly-trend', { params: { year } }).then(r => r.data),
  })
}

export function useCategoryBreakdown(month: number, year: number) {
  return useQuery({
    queryKey: ['category-breakdown', month, year],
    queryFn: () => api.get('/reports/category-breakdown', { params: { month, year } }).then(r => r.data),
  })
}

export function useDailySpending(month: number, year: number) {
  return useQuery({
    queryKey: ['daily-spending', month, year],
    queryFn: () => api.get('/reports/daily', { params: { month, year } }).then(r => r.data),
  })
}
