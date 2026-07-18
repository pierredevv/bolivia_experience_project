import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from '../../components/ui/EmptyState'
import { Inbox } from 'lucide-react'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No items"
        description="There are no items to display."
      />
    )
    expect(screen.getByText('No items')).toBeInTheDocument()
    expect(screen.getByText('There are no items to display.')).toBeInTheDocument()
  })

  it('renders without action button', () => {
    render(
      <EmptyState icon={Inbox} title="Empty" description="Nothing here" />
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        icon={Inbox}
        title="Empty"
        description="Nothing here"
        action={{ label: 'Create New', onClick }}
      />
    )
    expect(screen.getByText('Create New')).toBeInTheDocument()
  })

  it('calls action onClick when button clicked', async () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        icon={Inbox}
        title="Empty"
        description="Nothing here"
        action={{ label: 'Create New', onClick }}
      />
    )
    await userEvent.click(screen.getByText('Create New'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
