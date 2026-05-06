import { formatCurrency } from '../../utils/formatters.js'
import { getCategoryName, getCategoryIcon } from '../../constants/categories.js'

export default function RecurringItem({ item, categories, onEdit, onDelete }) {
  const catName = getCategoryName(item.category, categories)
  const catIcon = getCategoryIcon(item.category, categories)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`"${item.memo || catName}" 반복 항목을 삭제하시겠습니까?`)) {
      onDelete(item.id)
    }
  }

  return (
    <div className="recurring-item">
      <div className={`recurring-item-icon ${item.type}`}>
        {catIcon}
      </div>

      <div className="recurring-item-info">
        <div className="recurring-item-title">{item.memo || catName}</div>
        <div className="recurring-item-meta">
          {catName} &middot; 매월 {item.dayOfMonth}일 자동 등록
          {item.tags?.length > 0 && (
            <span> &middot; {item.tags.map(t => `#${t}`).join(' ')}</span>
          )}
        </div>
      </div>

      <div className={`recurring-item-amount ${item.type}`}>
        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}원
      </div>

      <div className="recurring-item-actions">
        <button
          className="btn btn-icon btn-sm"
          onClick={() => onEdit(item)}
          title="수정"
          style={{ fontSize: '0.85rem' }}
        >
          ✏️
        </button>
        <button
          className="btn btn-icon btn-sm"
          onClick={handleDelete}
          title="삭제"
          style={{ fontSize: '0.85rem', color: 'var(--expense)' }}
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
