const NAV_ITEMS = [
  { id: 'dashboard', label: '대시보드', icon: '📊' },
  { id: 'transactions', label: '거래 목록', icon: '📋' },
  { id: 'budget', label: '예산 관리', icon: '💼' },
  { id: 'recurring', label: '반복 항목', icon: '🔄' },
]

export default function Navigation({ currentPage, onNavigate, onAddClick }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">💰</span>
          <span>가계부</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item${currentPage === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="sidebar-add-btn" onClick={onAddClick}>
          <span>+</span>
          <span>내역 추가</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {NAV_ITEMS.slice(0, 2).map(item => (
            <button
              key={item.id}
              className={`bottom-nav-item${currentPage === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <button className="bottom-nav-add" onClick={onAddClick} aria-label="내역 추가">
            +
          </button>

          {NAV_ITEMS.slice(2).map(item => (
            <button
              key={item.id}
              className={`bottom-nav-item${currentPage === item.id ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
