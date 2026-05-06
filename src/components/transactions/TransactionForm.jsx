import { useState, useEffect, useRef, useCallback } from 'react'
import { getTodayStr, formatInputAmount, parseAmount } from '../../utils/formatters.js'

export default function TransactionForm({
  initialData,
  categories,
  onSubmit,
  onClose,
  onAddCategory,
}) {
  const isEdit = !!initialData?.id

  const [type, setType] = useState(initialData?.type || 'expense')
  const [date, setDate] = useState(initialData?.date || getTodayStr())
  const [amountStr, setAmountStr] = useState(
    initialData?.amount ? formatInputAmount(String(initialData.amount)) : ''
  )
  const [category, setCategory] = useState(initialData?.category || '')
  const [memo, setMemo] = useState(initialData?.memo || '')
  const [tags, setTags] = useState(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false)
  const [error, setError] = useState('')

  // 카테고리 추가 인라인
  const [showAddCat, setShowAddCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatIcon, setNewCatIcon] = useState('')

  const amountRef = useRef(null)

  const filteredCategories = categories.filter(c => c.type === type)

  useEffect(() => {
    // 타입이 바뀌면 카테고리 초기화
    if (category) {
      const stillValid = filteredCategories.some(c => c.id === category)
      if (!stillValid) setCategory('')
    }
  }, [type])

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (!raw) {
      setAmountStr('')
      return
    }
    setAmountStr(parseInt(raw, 10).toLocaleString('ko-KR'))
  }

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().replace(/,$/, '')
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return
    const newCat = await onAddCategory({
      name: newCatName.trim(),
      type,
      icon: newCatIcon.trim() || (type === 'income' ? '💰' : '📌'),
    })
    if (newCat) setCategory(newCat.id)
    setNewCatName('')
    setNewCatIcon('')
    setShowAddCat(false)
  }

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    const amount = parseAmount(amountStr)

    if (!amount || amount <= 0) {
      setError('금액을 입력해주세요.')
      amountRef.current?.focus()
      return
    }
    if (!category) {
      setError('카테고리를 선택해주세요.')
      return
    }
    if (!date) {
      setError('날짜를 선택해주세요.')
      return
    }

    setError('')
    onSubmit({
      ...(initialData || {}),
      date,
      type,
      amount,
      category,
      memo,
      tags,
      isRecurring,
      recurringId: initialData?.recurringId || null,
    })
  }, [amountStr, category, date, type, memo, tags, isRecurring, initialData, onSubmit])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{isEdit ? '내역 수정' : '내역 추가'}</div>
          <button className="modal-close" onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* 수입/지출 토글 */}
            <div className="form-group">
              <label className="form-label">구분</label>
              <div className="type-toggle">
                <button
                  type="button"
                  className={`type-toggle-btn income${type === 'income' ? ' active' : ''}`}
                  onClick={() => setType('income')}
                >
                  수입
                </button>
                <button
                  type="button"
                  className={`type-toggle-btn expense${type === 'expense' ? ' active' : ''}`}
                  onClick={() => setType('expense')}
                >
                  지출
                </button>
              </div>
            </div>

            {/* 날짜 & 금액 */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">날짜 <span>*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">금액 <span>*</span></label>
                <input
                  ref={amountRef}
                  type="text"
                  inputMode="numeric"
                  className="form-control"
                  value={amountStr}
                  onChange={handleAmountChange}
                  placeholder="0"
                />
              </div>
            </div>

            {/* 카테고리 */}
            <div className="form-group">
              <label className="form-label">카테고리 <span>*</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">카테고리 선택</option>
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddCat(v => !v)}
                  style={{ flexShrink: 0 }}
                >
                  + 추가
                </button>
              </div>

              {/* 인라인 카테고리 추가 */}
              {showAddCat && (
                <div style={{
                  marginTop: 8,
                  padding: '12px',
                  background: 'var(--primary-light)',
                  borderRadius: 'var(--radius)',
                  border: '1px dashed var(--primary)',
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>
                    새 카테고리 ({type === 'income' ? '수입' : '지출'})
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="아이콘 (예: 🍕)"
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      style={{ flex: '0 0 80px', padding: '7px 10px' }}
                      maxLength={2}
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="카테고리 이름"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      style={{ flex: 1, padding: '7px 10px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleAddCategory}
                      disabled={!newCatName.trim()}
                    >
                      추가
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 메모 */}
            <div className="form-group">
              <label className="form-label">메모</label>
              <input
                type="text"
                className="form-control"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="내용을 입력하세요"
                maxLength={100}
              />
            </div>

            {/* 태그 */}
            <div className="form-group">
              <label className="form-label">태그</label>
              <div
                className="tag-input-wrapper"
                onClick={() => document.getElementById('tag-input-field')?.focus()}
              >
                {tags.map(tag => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button
                      type="button"
                      className="tag-chip-remove"
                      onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="tag-input-field"
                  className="tag-input"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={tags.length === 0 ? 'Enter로 추가' : ''}
                />
              </div>
              <div className="form-hint">Enter 또는 쉼표로 구분해 입력하세요</div>
            </div>

            {/* 반복 여부 */}
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="is-recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <label htmlFor="is-recurring" className="checkbox-label">
                  반복 항목으로 등록
                </label>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--expense-light)',
                color: 'var(--expense)',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? '수정 완료' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
