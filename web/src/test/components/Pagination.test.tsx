import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from '../../components/ui/Pagination'

describe('Pagination', () => {
  const defaultProps = {
    page: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  }

  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} />)
    expect(container.firstChild).toBeNull()
  })

  it('shows current page info', () => {
    render(<Pagination {...defaultProps} />)
    expect(screen.getByText('Página 1 de 5')).toBeInTheDocument()
  })

  it('shows range info when total and limit provided', () => {
    render(<Pagination {...defaultProps} page={1} total={50} limit={10} />)
    expect(screen.getByText(/Mostrando 1 a 10 de 50/)).toBeInTheDocument()
  })

  it('calls onPageChange with page number', async () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByText('3'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} page={1} />)
    const prevBtn = screen.getAllByRole('button')[0]
    expect(prevBtn).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} page={5} />)
    const nextBtn = screen.getAllByRole('button')[screen.getAllByRole('button').length - 1]
    expect(nextBtn).toBeDisabled()
  })

  it('navigates to next page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} page={2} onPageChange={onPageChange} />)
    const nextBtn = screen.getAllByRole('button')[screen.getAllByRole('button').length - 1]
    await userEvent.click(nextBtn)
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('navigates to previous page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} page={3} onPageChange={onPageChange} />)
    const prevBtn = screen.getAllByRole('button')[0]
    await userEvent.click(prevBtn)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('shows ellipsis for many pages', () => {
    render(<Pagination {...defaultProps} page={5} totalPages={10} />)
    const ellipses = screen.getAllByText('...')
    expect(ellipses.length).toBeGreaterThanOrEqual(1)
  })
})
