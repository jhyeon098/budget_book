import { formatMonth, getCurrentMonth } from '../../utils/formatters.js'

export default function Header({ onAddClick }) {
  const now = new Date()
  const month = getCurrentMonth()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const dateStr = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 (${days[now.getDay()]})`

  return (
    <header className="header">
      <div className="header-logo">
        <span className="header-logo-icon">💰</span>
        <span>가계부</span>
      </div>
      <div className="header-actions">
        <span className="header-date">{dateStr}</span>
        <button className="btn btn-primary btn-sm" onClick={onAddClick}>
          + 내역 추가
        </button>
      </div>
    </header>
  )
}
