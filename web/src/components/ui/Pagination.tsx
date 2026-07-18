import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  total?: number
  limit?: number
}

export default function Pagination({ page, totalPages, onPageChange, total, limit }: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const left = Math.max(2, page - delta)
    const right = Math.min(totalPages - 1, page + delta)
    const pages: (number | 'ellipsis')[] = [1]
    if (left > 2) pages.push('ellipsis')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push('ellipsis')
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  return (
    <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-xl shadow-sm p-4">
      {total !== undefined && limit !== undefined ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total}
        </p>
      ) : (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Página {page} de {totalPages}
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
        </button>
        {getVisiblePages().map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-neutral-400 dark:text-neutral-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                p === page
                  ? 'bg-primary-700 text-white'
                  : 'border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
        </button>
      </div>
    </div>
  )
}
