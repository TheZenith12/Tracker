import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export function useAiAdvice(enabled = false) {
  return useQuery({
    queryKey: ['ai-advice'],
    queryFn: () => api.get('/ai/advice').then(r => r.data),
    enabled,
    staleTime: 1000 * 60 * 30, // 30 min — avoid unnecessary API calls
    retry: 1,
  })
}
