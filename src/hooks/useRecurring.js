import { useState, useCallback, useEffect } from 'react'

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function useRecurring() {
  const [recurringItems, setRecurringItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recurring')
      .then(r => r.json())
      .then(setRecurringItems)
      .catch(err => console.error('반복항목 로드 실패:', err))
      .finally(() => setLoading(false))
  }, [])

  const addRecurring = useCallback(async (data) => {
    const newItem = {
      id: makeId(),
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      memo: data.memo || '',
      tags: data.tags || [],
      dayOfMonth: Number(data.dayOfMonth) || 1,
    }
    const res = await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
    const created = await res.json()
    setRecurringItems(prev => [...prev, created])
    return created
  }, [])

  const updateRecurring = useCallback(async (id, data) => {
    const res = await fetch(`/api/recurring/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        amount: Number(data.amount),
        dayOfMonth: Number(data.dayOfMonth),
        tags: data.tags || [],
      }),
    })
    const updated = await res.json()
    setRecurringItems(prev => prev.map(item => item.id === id ? updated : item))
  }, [])

  const deleteRecurring = useCallback(async (id) => {
    await fetch(`/api/recurring/${id}`, { method: 'DELETE' })
    setRecurringItems(prev => prev.filter(item => item.id !== id))
  }, [])

  return {
    recurringItems,
    loading,
    addRecurring,
    updateRecurring,
    deleteRecurring,
  }
}
