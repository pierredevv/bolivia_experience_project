import { type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  accent?: 'primary' | 'secondary'
}

export default function EmptyState({ icon: Icon, title, description, action, accent = 'primary' }: EmptyStateProps) {
  const btnColor = accent === 'secondary'
    ? 'bg-secondary-700 hover:bg-secondary-800'
    : 'bg-primary-700 hover:bg-primary-800'

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn('px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors', btnColor)}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
