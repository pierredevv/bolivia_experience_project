import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext'

const TestComponent = () => {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolvedTheme">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('defaults to system theme', () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('system')
  })

  it('sets theme to light', async () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>)
    await userEvent.click(screen.getByText('Light'))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(screen.getByTestId('resolvedTheme')).toHaveTextContent('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('sets theme to dark', async () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>)
    await userEvent.click(screen.getByText('Dark'))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('resolvedTheme')).toHaveTextContent('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('persists theme to localStorage', async () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>)
    await userEvent.click(screen.getByText('Dark'))
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('restores theme from localStorage', () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeProvider><TestComponent /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('adds dark class to html when dark', async () => {
    render(<ThemeProvider><TestComponent /></ThemeProvider>)
    await userEvent.click(screen.getByText('Dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from html when light', async () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeProvider><TestComponent /></ThemeProvider>)
    await userEvent.click(screen.getByText('Light'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
