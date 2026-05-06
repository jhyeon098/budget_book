/**
 * 숫자를 천단위 쉼표 포함 한국 원화 형식으로 반환
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0'
  return Math.abs(Number(amount)).toLocaleString('ko-KR')
}

/**
 * 금액 표시 (부호 + 단위 포함)
 */
export function formatAmount(amount, type) {
  const abs = formatCurrency(amount)
  if (type === 'income') return `+${abs}원`
  if (type === 'expense') return `-${abs}원`
  return `${abs}원`
}

/**
 * YYYY-MM-DD 형식의 날짜를 한국어 날짜로 변환
 */
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`
}

/**
 * YYYY-MM-DD 날짜에서 요일 반환
 */
export function getDayOfWeek(dateStr) {
  if (!dateStr) return ''
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const date = new Date(dateStr)
  return days[date.getDay()]
}

/**
 * YYYY-MM-DD 날짜를 MM/DD (요일) 형식으로
 */
export function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const [, month, day] = dateStr.split('-')
  const dow = getDayOfWeek(dateStr)
  return `${parseInt(month)}/${parseInt(day)} (${dow})`
}

/**
 * 날짜를 YYYY-MM 형식으로 반환
 */
export function getYearMonth(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 7)
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export function getTodayStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 현재 월을 YYYY-MM 형식으로 반환
 */
export function getCurrentMonth() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/**
 * 이전 월 반환
 */
export function getPrevMonth(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  const date = new Date(y, m - 2, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * 다음 월 반환
 */
export function getNextMonth(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  const date = new Date(y, m, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * YYYY-MM 을 한국어로 표시
 */
export function formatMonth(yearMonth) {
  if (!yearMonth) return ''
  const [y, m] = yearMonth.split('-')
  return `${y}년 ${parseInt(m)}월`
}

/**
 * 숫자 입력값에서 쉼표 제거 후 숫자 반환
 */
export function parseAmount(str) {
  if (!str) return 0
  const num = parseInt(String(str).replace(/[^0-9]/g, ''), 10)
  return isNaN(num) ? 0 : num
}

/**
 * 입력 중인 금액을 천단위 쉼표로 포맷 (표시용)
 */
export function formatInputAmount(str) {
  const digits = String(str).replace(/[^0-9]/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('ko-KR')
}

/**
 * 퍼센트 계산 (0~100, 소수점 1자리)
 */
export function calcPercent(part, total) {
  if (!total || total === 0) return 0
  return Math.min(Math.round((part / total) * 1000) / 10, 100)
}

/**
 * 변화율 포맷 (이전 대비 %)
 */
export function formatChange(current, prev) {
  if (!prev || prev === 0) {
    if (current > 0) return { text: '신규', dir: 'up' }
    return { text: '-', dir: 'neutral' }
  }
  const pct = Math.round(((current - prev) / prev) * 100)
  const dir = pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral'
  const sign = pct > 0 ? '+' : ''
  return { text: `${sign}${pct}%`, dir }
}
