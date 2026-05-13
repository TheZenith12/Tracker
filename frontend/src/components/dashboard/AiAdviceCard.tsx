'use client'
import { useState } from 'react'
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAiAdvice } from '@/hooks/useAiAdvice'
import { Skeleton } from '@/components/ui/Skeleton'

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <p key={i} className="font-semibold text-gray-900 dark:text-white mt-3 first:mt-0">{line.slice(3)}</p>
        }
        if (line.startsWith('- ')) {
          return <p key={i} className="pl-3 before:content-['•'] before:mr-2 before:text-primary-500">{line.slice(2)}</p>
        }
        if (!line.trim()) return null
        // Handle **bold**
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>
                : part,
            )}
          </p>
        )
      })}
    </div>
  )
}

export default function AiAdviceCard() {
  const [enabled, setEnabled] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const qc = useQueryClient()
  const { data, isLoading, isError } = useAiAdvice(enabled)

  const handleGenerate = () => {
    if (enabled) {
      qc.invalidateQueries({ queryKey: ['ai-advice'] })
    } else {
      setEnabled(true)
      setExpanded(true)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">AI санхүүгийн зөвлөгөө</h3>
        </div>
        <div className="flex items-center gap-1">
          {data && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            {data ? 'Шинэчлэх' : 'Зөвлөгөө авах'}
          </button>
        </div>
      </div>

      {!enabled && !data && (
        <p className="text-sm text-gray-400 text-center py-6">
          Таны санхүүгийн мэдээлэлд үндэслэн AI зөвлөгөө авахын тулд дээрх товчийг дарна уу.
        </p>
      )}

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500 text-center py-4">
          Зөвлөгөө авахад алдаа гарлаа. API түлхүүр тохируулсан эсэхийг шалгана уу.
        </p>
      )}

      {data && expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <MarkdownText text={data.advice} />
          <p className="text-xs text-gray-400 mt-4">
            {new Date(data.generatedAt).toLocaleString('mn-MN')}
          </p>
        </div>
      )}
    </div>
  )
}
