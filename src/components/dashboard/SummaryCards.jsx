import { formatCurrency, formatChange } from '../../utils/formatters.js'

function ChangeIndicator({ current, prev, type }) {
  const { text, dir } = formatChange(current, prev)

  let className = 'change-neutral'
  let arrow = ''

  if (dir === 'up') {
    className = type === 'income' ? 'change-income-up' : 'change-up'
    arrow = '↑'
  } else if (dir === 'down') {
    className = type === 'income' ? 'change-up' : 'change-down'
    arrow = '↓'
  }

  if (text === '-' || text === '신규') {
    return <span className="change-neutral">{text}</span>
  }

  return (
    <span className={className}>
      {arrow} {text} 지난달 대비
    </span>
  )
}

export default function SummaryCards({ current, prev }) {
  const c = current || { income: 0, expense: 0, balance: 0 }
  const p = prev || { income: 0, expense: 0, balance: 0 }

  return (
    <div className="summary-cards">
      <div className="summary-card income-card">
        <div className="summary-card-label">이번달 총 수입</div>
        <div className="summary-card-amount income">
          {formatCurrency(c.income)}원
        </div>
        <div className="summary-card-change">
          <ChangeIndicator current={c.income} prev={p.income} type="income" />
        </div>
      </div>

      <div className="summary-card expense-card">
        <div className="summary-card-label">이번달 총 지출</div>
        <div className="summary-card-amount expense">
          {formatCurrency(c.expense)}원
        </div>
        <div className="summary-card-change">
          <ChangeIndicator current={c.expense} prev={p.expense} type="expense" />
        </div>
      </div>

      <div className="summary-card balance-card">
        <div className="summary-card-label">잔액</div>
        <div className={`summary-card-amount ${c.balance >= 0 ? 'balance' : 'expense'}`}>
          {c.balance < 0 ? '-' : ''}{formatCurrency(c.balance)}원
        </div>
        <div className="summary-card-change">
          <span className="change-neutral">
            수입 - 지출
          </span>
        </div>
      </div>
    </div>
  )
}
