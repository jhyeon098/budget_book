import { useState, useMemo } from 'react'
import TransactionItem from './TransactionItem.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { formatShortDate, formatCurrency, getDayOfWeek } from '../../utils/formatters.js'
import { exportTransactionsToCSV } from '../../utils/csvExport.js'

const TYPE_FILTERS = [
  { id: 'all', label: '전체' },
  { id: 'income', label: '수입' },
  { id: 'expense', label: '지출' },
]

export default function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
  onAddClick,
}) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false
      if (startDate && tx.date < startDate) return false
      if (endDate && tx.date > endDate) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const catName = categories.find(c => c.id === tx.category)?.name || ''
        const match =
          (tx.memo || '').toLowerCase().includes(q) ||
          catName.toLowerCase().includes(q) ||
          (tx.tags || []).some(t => t.toLowerCase().includes(q))
        if (!match) return false
      }
      return true
    })
  }, [transactions, typeFilter, categoryFilter, searchQuery, startDate, endDate, categories])

  // 날짜별 그룹핑
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(tx => {
      if (!map[tx.date]) map[tx.date] = []
      map[tx.date].push(tx)
    })
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  const totalIncome = useMemo(() =>
    filtered.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0),
    [filtered]
  )
  const totalExpense = useMemo(() =>
    filtered.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0),
    [filtered]
  )

  const expenseCategories = useMemo(() =>
    categories.filter(c => transactions.some(t => t.category === c.id)),
    [categories, transactions]
  )

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert('내보낼 데이터가 없습니다.')
      return
    }
    exportTransactionsToCSV(filtered, categories)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">거래 목록</div>
          <div className="page-subtitle">총 {filtered.length}건</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            📥 CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={onAddClick}>
            + 추가
          </button>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
        <div className="transaction-filters">
          {/* 유형 필터 */}
          <div className="filter-group">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.id}
                className={`filter-btn${typeFilter === f.id ? ' active' : ''}`}
                onClick={() => setTypeFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* 카테고리 필터 */}
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 120, padding: '7px 30px 7px 12px', fontSize: '0.85rem' }}
          >
            <option value="all">전체 카테고리</option>
            {expenseCategories.map(c => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          {/* 검색 */}
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="메모, 카테고리, 태그 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 날짜 범위 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>기간:</span>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>~</span>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}
          />
          {(startDate || endDate) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setStartDate(''); setEndDate('') }}
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 요약 */}
      {filtered.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 16,
          marginBottom: 12,
          padding: '10px 14px',
          background: 'var(--card)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          fontSize: '0.875rem',
          flexWrap: 'wrap',
        }}>
          <span>
            수입 <strong style={{ color: 'var(--income)' }}>+{formatCurrency(totalIncome)}원</strong>
          </span>
          <span>
            지출 <strong style={{ color: 'var(--expense)' }}>-{formatCurrency(totalExpense)}원</strong>
          </span>
          <span>
            합계 <strong style={{ color: totalIncome - totalExpense >= 0 ? 'var(--primary)' : 'var(--expense)' }}>
              {formatCurrency(totalIncome - totalExpense)}원
            </strong>
          </span>
        </div>
      )}

      {/* 목록 */}
      {grouped.length === 0 ? (
        <EmptyState
          icon="📋"
          title="거래 내역이 없습니다"
          description="내역을 추가하거나 필터 조건을 변경해보세요."
          action={{ label: '+ 내역 추가', onClick: onAddClick }}
        />
      ) : (
        <div className="transaction-list">
          {grouped.map(([date, txList]) => {
            const dayIncome = txList.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
            const dayExpense = txList.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
            return (
              <div key={date} className="transaction-date-group">
                <div className="transaction-date-header">
                  <span>{formatShortDate(date)}</span>
                  <div className="transaction-date-summary">
                    {dayIncome > 0 && (
                      <span style={{ color: 'var(--income)' }}>+{formatCurrency(dayIncome)}</span>
                    )}
                    {dayExpense > 0 && (
                      <span style={{ color: 'var(--expense)' }}>-{formatCurrency(dayExpense)}</span>
                    )}
                  </div>
                </div>
                {txList.map(tx => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    categories={categories}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
