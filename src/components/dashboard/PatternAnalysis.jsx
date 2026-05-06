import { formatCurrency } from '../../utils/formatters.js'
import { getCategoryName } from '../../constants/categories.js'

export default function PatternAnalysis({ transactions, categoryExpenses, categories = [] }) {
  const txList = transactions || []

  // 최대 지출 카테고리
  const maxCatEntry = Object.entries(categoryExpenses || {}).sort((a, b) => b[1] - a[1])[0]
  const maxCatName = maxCatEntry ? getCategoryName(maxCatEntry[0], categories) : null
  const maxCatAmount = maxCatEntry ? maxCatEntry[1] : 0

  // 최다 지출 요일
  const dayMap = { '일': 0, '월': 0, '화': 0, '수': 0, '목': 0, '금': 0, '토': 0 }
  const days = ['일', '월', '화', '수', '목', '금', '토']
  txList.filter(t => t.type === 'expense').forEach(tx => {
    const d = new Date(tx.date)
    dayMap[days[d.getDay()]] += tx.amount || 0
  })
  const maxDayEntry = Object.entries(dayMap).sort((a, b) => b[1] - a[1])[0]
  const maxDay = maxDayEntry && maxDayEntry[1] > 0 ? maxDayEntry[0] : null
  const maxDayAmount = maxDayEntry ? maxDayEntry[1] : 0

  // 고정지출 추정 (반복 항목 기반)
  const fixedExpenses = txList.filter(t => t.type === 'expense' && t.isRecurring)
  const fixedTotal = fixedExpenses.reduce((s, t) => s + (t.amount || 0), 0)

  // 평균 일 지출
  const expList = txList.filter(t => t.type === 'expense')
  const totalExpense = expList.reduce((s, t) => s + (t.amount || 0), 0)
  const uniqueDays = [...new Set(expList.map(t => t.date))].length
  const avgDaily = uniqueDays > 0 ? Math.round(totalExpense / uniqueDays) : 0

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">패턴 분석</div>
      </div>
      <div className="pattern-list">
        <div className="pattern-item">
          <div className="pattern-icon">🏆</div>
          <div className="pattern-info">
            <div className="pattern-label">최대 지출 카테고리</div>
            <div className="pattern-value">
              {maxCatName
                ? `${maxCatName} (${formatCurrency(maxCatAmount)}원)`
                : '데이터 없음'}
            </div>
          </div>
        </div>

        <div className="pattern-item">
          <div className="pattern-icon">📅</div>
          <div className="pattern-info">
            <div className="pattern-label">최다 지출 요일</div>
            <div className="pattern-value">
              {maxDay
                ? `${maxDay}요일 (${formatCurrency(maxDayAmount)}원)`
                : '데이터 없음'}
            </div>
          </div>
        </div>

        <div className="pattern-item">
          <div className="pattern-icon">🔄</div>
          <div className="pattern-info">
            <div className="pattern-label">고정지출 추정</div>
            <div className="pattern-value">
              {fixedTotal > 0
                ? `${formatCurrency(fixedTotal)}원 (${fixedExpenses.length}건)`
                : '반복항목 없음'}
            </div>
          </div>
        </div>

        <div className="pattern-item">
          <div className="pattern-icon">📊</div>
          <div className="pattern-info">
            <div className="pattern-label">일평균 지출</div>
            <div className="pattern-value">
              {avgDaily > 0
                ? `${formatCurrency(avgDaily)}원`
                : '데이터 없음'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
