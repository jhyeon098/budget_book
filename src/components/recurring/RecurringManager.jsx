import { useState } from 'react'
import RecurringItem from './RecurringItem.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { parseAmount } from '../../utils/formatters.js'

const EMPTY_FORM = {
  type: 'expense',
  amountStr: '',
  category: '',
  memo: '',
  tags: [],
  tagInput: '',
  dayOfMonth: '',
}

export default function RecurringManager({
  recurringItems,
  categories,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const filteredCategories = categories.filter(c => c.type === form.type)

  const openAdd = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      type: item.type,
      amountStr: item.amount ? item.amount.toLocaleString('ko-KR') : '',
      category: item.category,
      memo: item.memo || '',
      tags: item.tags || [],
      tagInput: '',
      dayOfMonth: String(item.dayOfMonth),
    })
    setErrors({})
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const validate = () => {
    const errs = {}
    if (!parseAmount(form.amountStr)) errs.amount = '금액을 입력해주세요'
    if (!form.category) errs.category = '카테고리를 선택해주세요'
    const day = parseInt(form.dayOfMonth, 10)
    if (!day || day < 1 || day > 31) errs.dayOfMonth = '1~31 사이의 날짜를 입력해주세요'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const data = {
      type: form.type,
      amount: parseAmount(form.amountStr),
      category: form.category,
      memo: form.memo,
      tags: form.tags,
      dayOfMonth: parseInt(form.dayOfMonth, 10),
    }
    if (editingId) {
      onUpdate(editingId, data)
    } else {
      onAdd(data)
    }
    closeForm()
  }

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    setForm(f => ({ ...f, amountStr: raw ? parseInt(raw, 10).toLocaleString('ko-KR') : '' }))
  }

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && form.tagInput.trim()) {
      e.preventDefault()
      const tag = form.tagInput.trim().replace(/,$/, '')
      if (tag && !form.tags.includes(tag)) {
        setForm(f => ({ ...f, tags: [...f.tags, tag], tagInput: '' }))
      } else {
        setForm(f => ({ ...f, tagInput: '' }))
      }
    }
  }

  const removeTag = (tag) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))
  }

  const incomeItems = recurringItems.filter(i => i.type === 'income')
  const expenseItems = recurringItems.filter(i => i.type === 'expense')

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">반복 항목</div>
          <div className="page-subtitle">매월 자동으로 등록될 수입/지출 항목</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + 항목 추가
        </button>
      </div>

      {recurringItems.length === 0 ? (
        <EmptyState
          icon="🔄"
          title="반복 항목이 없습니다"
          description="월세, 월급 등 매월 반복되는 항목을 등록해보세요"
          action={{ label: '+ 반복 항목 추가', onClick: openAdd }}
        />
      ) : (
        <>
          {incomeItems.length > 0 && (
            <div className="mb-16">
              <div className="section-title">💰 수입 ({incomeItems.length}건)</div>
              <div className="recurring-list">
                {incomeItems.map(item => (
                  <RecurringItem
                    key={item.id}
                    item={item}
                    categories={categories}
                    onEdit={openEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {expenseItems.length > 0 && (
            <div>
              <div className="section-title">💳 지출 ({expenseItems.length}건)</div>
              <div className="recurring-list">
                {expenseItems.map(item => (
                  <RecurringItem
                    key={item.id}
                    item={item}
                    categories={categories}
                    onEdit={openEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 추가 / 수정 모달 */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) closeForm() }}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                {editingId ? '반복 항목 수정' : '반복 항목 추가'}
              </div>
              <button className="modal-close" onClick={closeForm} aria-label="닫기">✕</button>
            </div>

            <div className="modal-body">
              {/* 구분 */}
              <div className="form-group">
                <label className="form-label">구분</label>
                <div className="type-toggle">
                  <button
                    type="button"
                    className={`type-toggle-btn income${form.type === 'income' ? ' active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, type: 'income', category: '' }))}
                  >
                    수입
                  </button>
                  <button
                    type="button"
                    className={`type-toggle-btn expense${form.type === 'expense' ? ' active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, type: 'expense', category: '' }))}
                  >
                    지출
                  </button>
                </div>
              </div>

              <div className="form-row">
                {/* 금액 */}
                <div className="form-group">
                  <label className="form-label">금액 <span>*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-control"
                    value={form.amountStr}
                    onChange={handleAmountChange}
                    placeholder="0"
                  />
                  {errors.amount && (
                    <div style={{ color: 'var(--expense)', fontSize: '0.8rem', marginTop: 4 }}>
                      {errors.amount}
                    </div>
                  )}
                </div>

                {/* 반복 일자 */}
                <div className="form-group">
                  <label className="form-label">매월 몇 일 <span>*</span></label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.dayOfMonth}
                    onChange={e => setForm(f => ({ ...f, dayOfMonth: e.target.value }))}
                    placeholder="1~31"
                    min="1"
                    max="31"
                  />
                  {errors.dayOfMonth && (
                    <div style={{ color: 'var(--expense)', fontSize: '0.8rem', marginTop: 4 }}>
                      {errors.dayOfMonth}
                    </div>
                  )}
                </div>
              </div>

              {/* 카테고리 */}
              <div className="form-group">
                <label className="form-label">카테고리 <span>*</span></label>
                <select
                  className="form-control"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">카테고리 선택</option>
                  {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <div style={{ color: 'var(--expense)', fontSize: '0.8rem', marginTop: 4 }}>
                    {errors.category}
                  </div>
                )}
              </div>

              {/* 메모 */}
              <div className="form-group">
                <label className="form-label">메모</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.memo}
                  onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
                  placeholder="메모 (예: 넷플릭스, 월급)"
                  maxLength={100}
                />
              </div>

              {/* 태그 */}
              <div className="form-group">
                <label className="form-label">태그</label>
                <div
                  className="tag-input-wrapper"
                  onClick={() => document.getElementById('rec-tag-input')?.focus()}
                >
                  {form.tags.map(tag => (
                    <span key={tag} className="tag-chip">
                      {tag}
                      <button
                        type="button"
                        className="tag-chip-remove"
                        onClick={e => { e.stopPropagation(); removeTag(tag) }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    id="rec-tag-input"
                    className="tag-input"
                    value={form.tagInput}
                    onChange={e => setForm(f => ({ ...f, tagInput: e.target.value }))}
                    onKeyDown={handleTagKeyDown}
                    placeholder={form.tags.length === 0 ? 'Enter로 추가' : ''}
                  />
                </div>
                <div className="form-hint">Enter 또는 쉼표로 구분해 입력하세요</div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeForm}>
                취소
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingId ? '수정 완료' : '추가하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
