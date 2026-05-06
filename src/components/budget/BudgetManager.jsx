import { useState, useMemo } from 'react'
import BudgetItem from './BudgetItem.jsx'
import EmptyState from '../common/EmptyState.jsx'
import {
  formatMonth,
  getPrevMonth,
  getNextMonth,
  getCurrentMonth,
  formatInputAmount,
  parseAmount,
} from '../../utils/formatters.js'
import { getCategoryName, getCategoryIcon } from '../../constants/categories.js'

export default function BudgetManager({
  categories,
  getCategoryExpenses,
  getBudgetStatus,
  onSetBudget,
  onDeleteBudget,
}) {
  const [month, setMonth] = useState(getCurrentMonth())
  const [addingFor, setAddingFor] = useState(null)
  const [newLimitStr, setNewLimitStr] = useState('')

  const expenseCategories = categories.filter(c => c.type === 'expense')

  const categoryExpenses = useMemo(
    () => getCategoryExpenses(month),
    [getCategoryExpenses, month]
  )

  const budgetStatus = useMemo(
    () => getBudgetStatus(month, categoryExpenses),
    [getBudgetStatus, month, categoryExpenses]
  )

  // 카테고리 ID → 예산 현황 맵
  const budgetMap = {}
  budgetStatus.forEach(b => { budgetMap[b.category] = b })

  const handleUpdate = (categoryId, limitAmount) => {
    onSetBudget(month, categoryId, limitAmount)
  }

  const handleAddBudget = (categoryId) => {
    const limit = parseAmount(newLimitStr)
    if (limit > 0) {
      onSetBudget(month, categoryId, limit)
    }
    setAddingFor(null)
    setNewLimitStr('')
  }

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setNewLimitStr(raw ? parseInt(raw, 10).toLocaleString('ko-KR') : '')
  }

  const totalBudget = budgetStatus.reduce((s, b) => s + (b.limitAmount || 0), 0)
  const totalUsed = budgetStatus.reduce((s, b) => s + (b.used || 0), 0)
  const overCount = budgetStatus.filter(b => b.isOver).length

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">예산 관리</div>
          <div className="page-subtitle">카테고리별 월 예산을 설정하세요</div>
        </div>
      </div>

      {/* 월 선택 */}
      <div className="budget-month-selector">
        <button className="btn btn-secondary btn-sm" onClick={() => setMonth(getPrevMonth(month))}>
          ‹
        </button>
        <span className="budget-month-display">{formatMonth(month)}</span>
        <button className="btn btn-secondary btn-sm" onClick={() => setMonth(getNextMonth(month))}>
          ›
        </button>
      </div>

      {/* 요약 */}
      {budgetStatus.length > 0 && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            display: 'flex',
            gap: 24,
            padding: '14px 20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>총 예산</div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{totalBudget.toLocaleString('ko-KR')}원</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>총 지출</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--expense)' }}>{totalUsed.toLocaleString('ko-KR')}원</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>잔여 예산</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: (totalBudget - totalUsed) >= 0 ? 'var(--income)' : 'var(--expense)' }}>
              {(totalBudget - totalUsed).toLocaleString('ko-KR')}원
            </div>
          </div>
          {overCount > 0 && (
            <div className="over-warning" style={{ margin: 0, alignSelf: 'center' }}>
              ⚠️ {overCount}개 카테고리 예산 초과
            </div>
          )}
        </div>
      )}

      {/* 카테고리 목록 */}
      <div className="budget-list">
        {expenseCategories.map(cat => {
          const budget = budgetMap[cat.id]
          const used = categoryExpenses[cat.id] || 0
          const catIcon = getCategoryIcon(cat.id, categories)
          const catName = getCategoryName(cat.id, categories)

          // 예산이 있으면 BudgetItem으로 표시
          if (budget) {
            return (
              <BudgetItem
                key={cat.id}
                budget={budget}
                categories={categories}
                onUpdate={(catId, limit) => handleUpdate(catId, limit)}
                onDelete={onDeleteBudget}
              />
            )
          }

          // 예산 추가 입력 중
          if (addingFor === cat.id) {
            return (
              <div key={cat.id} className="budget-add-form">
                <div className="budget-add-form-title">
                  {catIcon} {catName} 예산 설정
                  {used > 0 && (
                    <span
                      style={{
                        fontWeight: 400,
                        marginLeft: 8,
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                      }}
                    >
                      (이번 달 지출: {used.toLocaleString('ko-KR')}원)
                    </span>
                  )}
                </div>
                <div className="budget-input-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    value={newLimitStr}
                    onChange={handleAmountChange}
                    placeholder="예산 금액 (원)"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddBudget(cat.id)
                      if (e.key === 'Escape') { setAddingFor(null); setNewLimitStr('') }
                    }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAddBudget(cat.id)}
                    disabled={!newLimitStr}
                  >
                    설정
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setAddingFor(null); setNewLimitStr('') }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )
          }

          // 예산 미설정 카테고리 (지출이 있거나 없거나)
          return (
            <div
              key={cat.id}
              className="budget-item"
              style={{ opacity: used > 0 ? 1 : 0.6 }}
            >
              <div className="budget-item-header">
                <div className="budget-item-name">
                  <span>{catIcon}</span>
                  <span>{catName}</span>
                  {used > 0 && (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        fontWeight: 400,
                      }}
                    >
                      지출 {used.toLocaleString('ko-KR')}원
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setAddingFor(cat.id)
                    setNewLimitStr('')
                  }}
                >
                  + 예산 설정
                </button>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                설정된 예산이 없습니다
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
