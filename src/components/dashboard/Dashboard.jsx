import { useMemo } from 'react'
import SummaryCards from './SummaryCards.jsx'
import CategoryChart from './CategoryChart.jsx'
import BudgetOverview from './BudgetOverview.jsx'
import PatternAnalysis from './PatternAnalysis.jsx'
import { getCurrentMonth, getPrevMonth, formatMonth } from '../../utils/formatters.js'

export default function Dashboard({
  transactions,
  getMonthlySummary,
  getCategoryExpenses,
  getBudgetStatus,
  categories,
  onNavigateBudget,
  onAddClick,
}) {
  const currentMonth = getCurrentMonth()
  const prevMonth = getPrevMonth(currentMonth)

  const currentSummary = useMemo(() => getMonthlySummary(currentMonth), [getMonthlySummary, currentMonth])
  const prevSummary = useMemo(() => getMonthlySummary(prevMonth), [getMonthlySummary, prevMonth])
  const categoryExpenses = useMemo(() => getCategoryExpenses(currentMonth), [getCategoryExpenses, currentMonth])
  const budgetStatus = useMemo(() => getBudgetStatus(currentMonth, categoryExpenses), [getBudgetStatus, currentMonth, categoryExpenses])

  const currentMonthTx = useMemo(() =>
    transactions.filter(t => t.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">대시보드</div>
          <div className="page-subtitle">{formatMonth(currentMonth)} 현황</div>
        </div>
        <button className="btn btn-primary" onClick={onAddClick}>
          + 내역 추가
        </button>
      </div>

      <SummaryCards current={currentSummary} prev={prevSummary} />

      <div className="dashboard-grid">
        <CategoryChart
          categoryExpenses={categoryExpenses}
          categories={categories}
        />

        <BudgetOverview
          budgetStatus={budgetStatus}
          categories={categories}
          onNavigateBudget={onNavigateBudget}
        />

        <PatternAnalysis
          transactions={currentMonthTx}
          categoryExpenses={categoryExpenses}
          categories={categories}
        />
      </div>
    </div>
  )
}
