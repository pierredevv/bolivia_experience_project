import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete Item',
    message: 'Are you sure you want to delete this?',
  }

  it('renders nothing when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument()
  })

  it('renders title and message when open', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument()
  })

  it('shows default confirm label', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
  })

  it('shows custom confirm label', () => {
    render(<ConfirmDialog {...defaultProps} confirmLabel="Eliminar" />)
    expect(screen.getByText('Eliminar')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm clicked', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByText('Confirmar'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel clicked', async () => {
    const onClose = vi.fn()
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />)
    expect(screen.getByText('Procesando...')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeDisabled()
    expect(screen.getByText('Procesando...')).toBeDisabled()
  })

  it('applies danger variant styling', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />)
    const confirmBtn = screen.getByText('Confirmar')
    expect(confirmBtn.className).toContain('bg-red-600')
  })

  it('applies warning variant styling', () => {
    render(<ConfirmDialog {...defaultProps} variant="warning" />)
    const confirmBtn = screen.getByText('Confirmar')
    expect(confirmBtn.className).toContain('bg-yellow-500')
  })
})
