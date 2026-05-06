import { useState } from 'react'
import { formatCurrency, formatInputAmount, parseAmount } from '../../utils/formatters.js'
import { getCategoryName, getCategoryIcon } from '../../constants/categories.js'

export default function BudgetItem({ budget, categories, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [limitStr, setLimitStr] = useState(formatInputAmount(String(budget.limitAmount)))

  const catName = getCategoryName(budget.category, categories)
  const catIcon = getCategoryIcon(budget.category, categories)

  const used = budget.used || 0
  const limit = budget.limitAmount || 0
  const remaining = limit - used
  const percent = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0
  const isOver = used > limit

  const getProgressClass = () => {
    if (isOver) return 'danger'
    if (percent >= 80) return 'warning'
    return 'normal'
  }

  const handleSave = () => {
    const newLimit = parseAmount(limitStr)
    if (newLimit > 0) {
      onUpdate(budget.category, newLimit)
    }
    setEditing(false)
  }

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (!raw) { setLimitStr(''); return }
    setLimitStr(parseInt(raw, 10).toLocaleString('ko-KR'))
  }

  return (
    <div className={`budget-item${isOver ? ' over-budget' : ''}`}>
      <div className="budget-item-header">
        <div className="budget-item-name">
          <span>{catIcon}</span>
          <span>{catName}</span>
          {isOver && <span className="over-badge">초과</span>}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setLimitStr(formatInputAmount(String(budget.limitAmount)))
              setEditing(v => !v)
            }}
          >
            {editing ? '취소' : '수정'}
          </button>
          <button
            className="btn btn-sm"
            style={{ background: 'var(--expense-light)', color: 'var(--expense)' }}
            onClick={() => {
              if (window.confirm(`${catName} 예산을 삭제하시겠습니까?`)) {
                onDelete(budget.id)
              }
            }}
          >
            삭제
          </button>
        </div>
      </div>

      {/* 진행 바 */}
      <div className="progress-bar" style={{ marginBottom: 8 }}>
        <div
          className={`progress-fill ${getProgressClass()}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* 금액 정보 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>사용: </span>
          <span className={isOver ? 'text-expense' : ''} style={{ fontWeight: 600 }}>
            {formatCurrency(used)}원
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>예산: </span>
          <span style={{ fontWeight: 600 }}>{formatCurrency(limit)}원</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>{isOver ? '초과: ' : '잔여: '}</span>
          <span
            style={{ fontWeight: 600, color: isOver ? 'var(--expense)' : 'var(--income)' }}
          >
            {isOver ? '+' : ''}{formatCurrency(Math.abs(remaining))}원
          </span>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          {percent}%
        </div>
      </div>

      {isOver && (
        <div className="over-warning">
          ⚠️ 예산을 {formatCurrency(used - limit)}원 초과했습니다
        </div>
      )}

      {/* 편집 */}
      {editing && (
        <div className="budget-input-row" style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
            예산 금액:
          </label>
          <input
            type="text"
            inputMode="numeric"
            className="form-control"
            value={limitStr}
            onChange={handleAmountChange}
            placeholder="금액 입력"
            style={{ flex: 1, padding: '8px 12px' }}
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={handleSave}>저장</button>
        </div>
      )}
    </div>
  )
}
