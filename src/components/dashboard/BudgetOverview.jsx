import { formatCurrency } from '../../utils/formatters.js'
import { getCategoryName } from '../../constants/categories.js'
import EmptyState from '../common/EmptyState.jsx'

export default function BudgetOverview({ budgetStatus, categories = [], onNavigateBudget }) {
  if (!budgetStatus || budgetStatus.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">예산 현황</div>
          <button className="btn btn-sm btn-outline" onClick={onNavigateBudget}>관리</button>
        </div>
        <EmptyState icon="💼" title="예산이 설정되지 않았습니다" description="예산을 설정해 지출을 관리하세요" />
      </div>
    )
  }

  const getProgressClass = (percent, isOver) => {
    if (isOver) return 'danger'
    if (percent >= 80) return 'warning'
    return 'normal'
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">예산 현황</div>
        <button className="btn btn-sm btn-outline" onClick={onNavigateBudget}>관리</button>
      </div>

      <div className="budget-overview-list">
        {budgetStatus.slice(0, 5).map(b => {
          const catName = getCategoryName(b.category, categories)
          const pct = b.limitAmount > 0
            ? Math.min(Math.round((b.used / b.limitAmount) * 100), 100)
            : 0
          const progressClass = getProgressClass(pct, b.isOver)

          return (
            <div key={b.id} className="budget-overview-item">
              <div className="budget-overview-row">
                <span className="budget-overview-name">{catName}</span>
                <span className="budget-overview-amounts">
                  <span className={b.isOver ? 'over' : ''}>
                    {formatCurrency(b.used)}원
                  </span>
                  {' / '}
                  <span>{formatCurrency(b.limitAmount)}원</span>
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${progressClass}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {b.isOver && (
                <div className="over-warning" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                  ⚠️ {formatCurrency(b.used - b.limitAmount)}원 초과
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
