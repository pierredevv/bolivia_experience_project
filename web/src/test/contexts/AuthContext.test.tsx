import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'

const TestComponent = () => {
  const { user, token, isAuthenticated, isLoading, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'loaded'}</span>
      <span data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user">{user ? user.name : 'none'}</span>
      <span data-testid="token">{token || 'none'}</span>
      <button onClick={() => login('test-token', 'refresh-token', { id: '1', email: 'test@test.com', name: 'Test User', role: 'admin' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('provides initial unauthenticated state', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    expect(screen.getByTestId('authenticated')).toHaveTextContent('no')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('login sets user and token', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    await userEvent.click(screen.getByText('Login'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('yes')
    expect(screen.getByTestId('user')).toHaveTextContent('Test User')
    expect(screen.getByTestId('token')).toHaveTextContent('test-token')
  })

  it('login persists to localStorage', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    await userEvent.click(screen.getByText('Login'))
    expect(localStorage.getItem('token')).toBe('test-token')
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token')
    expect(localStorage.getItem('userId')).toBe('1')
    expect(JSON.parse(localStorage.getItem('user')!).name).toBe('Test User')
  })

  it('logout clears state', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    await userEvent.click(screen.getByText('Login'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('yes')
    await userEvent.click(screen.getByText('Logout'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('no')
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('logout clears localStorage', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>)
    await userEvent.click(screen.getByText('Login'))
    await userEvent.click(screen.getByText('Logout'))
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('restores state from localStorage', () => {
    localStorage.setItem('token', 'stored-token')
    localStorage.setItem('user', JSON.stringify({ id: '2', email: 'a@b.com', name: 'Stored User', role: 'empresa' }))
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('authenticated')).toHaveTextContent('yes')
    expect(screen.getByTestId('user')).toHaveTextContent('Stored User')
  })

  it('clears localStorage on invalid JSON', () => {
    localStorage.setItem('token', 'token')
    localStorage.setItem('user', 'invalid-json')
    render(<AuthProvider><TestComponent /></AuthProvider>)
    expect(screen.getByTestId('authenticated')).toHaveTextContent('no')
    expect(localStorage.getItem('token')).toBeNull()
  })
})
