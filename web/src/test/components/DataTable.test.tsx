import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataTable from '../../components/ui/DataTable'
import type { Column } from '../../components/ui/DataTable'

interface TestItem {
  id: string
  name: string
  role: string
}

const columns: Column<TestItem>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role' },
]

const data: TestItem[] = [
  { id: '1', name: 'Alice', role: 'Admin' },
  { id: '2', name: 'Bob', role: 'User' },
  { id: '3', name: 'Charlie', role: 'Admin' },
]

describe('DataTable', () => {
  it('renders table with columns and data', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('shows empty message when no data', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No data found" />)
    expect(screen.getByText('No data found')).toBeInTheDocument()
  })

  it('shows default empty message', () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument()
  })

  it('filters data when search is enabled', async () => {
    render(
      <DataTable columns={columns} data={data} searchable searchKey="name" searchPlaceholder="Search name" />
    )
    const searchInput = screen.getByPlaceholderText('Search name')
    await userEvent.type(searchInput, 'Alice')
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument()
  })

  it('sorts data when column header clicked', async () => {
    render(<DataTable columns={columns} data={data} />)
    const nameHeader = screen.getByText('Name')
    await userEvent.click(nameHeader)
    const rows = screen.getAllByRole('row')
    const firstDataRow = within(rows[1]).getAllByRole('cell')
    expect(firstDataRow[0].textContent).toBe('Alice')
  })

  it('calls onRowClick when row clicked', async () => {
    const onRowClick = vi.fn()
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />)
    await userEvent.click(screen.getByText('Alice'))
    expect(onRowClick).toHaveBeenCalledWith(data[0])
  })

  it('renders custom column content', () => {
    const customColumns: Column<TestItem>[] = [
      { key: 'name', label: 'Name', render: (item) => <strong>{item.name}</strong> },
      { key: 'role', label: 'Role' },
    ]
    render(<DataTable columns={customColumns} data={data} />)
    const strong = screen.getByText('Alice')
    expect(strong.tagName).toBe('STRONG')
  })
})
