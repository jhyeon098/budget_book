import { formatCurrency, formatShortDate } from '../../utils/formatters.js'
import { getCategoryName, getCategoryIcon } from '../../constants/categories.js'

export default function TransactionItem({ transaction, categories, onEdit, onDelete }) {
  const tx = transaction
  const catName = getCategoryName(tx.category, categories)
  const catIcon = getCategoryIcon(tx.category, categories)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`"${tx.memo || catName}" 내역을 삭제하시겠습니까?`)) {
      onDelete(tx.id)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit(tx)
  }

  return (
    <div className="transaction-item" onClick={handleEdit}>
      <div className={`transaction-category-icon ${tx.type}`}>
        {catIcon}
      </div>

      <div className="transaction-info">
        <div className="transaction-title">
          {tx.memo || catName}
        </div>
        <div className="transaction-meta">
          <span>{catName}</span>
          {tx.isRecurring && (
            <span className="transaction-recurring-badge">반복</span>
          )}
          {tx.tags && tx.tags.length > 0 && (
            <div className="transaction-tags">
              {tx.tags.map(tag => (
                <span key={tag} className="transaction-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <div className={`transaction-amount ${tx.type}`}>
          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}원
        </div>
        <div className="transaction-actions">
          <button
            className="btn btn-icon btn-sm"
            onClick={handleEdit}
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
    </div>
  )
}
