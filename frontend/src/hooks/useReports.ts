import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const useMonthlyTrend = (year: number) =>
  useQuery({
    queryKey: ['reports-trend', year],
    queryFn: () => api.get('/reports/monthly-trend', { params: { year } }).then(r => r.data),
  })

export const useCategoryBreakdown = (month: number, year: number) =>
  useQuery({
    queryKey: ['reports-category', month, year],
    queryFn: () => api.get('/reports/category-breakdown', { params: { month, year } }).then(r => r.data),
  })

export const useDailySpending = (month: number, year: number) =>
  useQuery({
    queryKey: ['reports-daily', month, year],
    queryFn: () => api.get('/reports/daily', { params: { month, year } }).then(r => r.data),
  })
