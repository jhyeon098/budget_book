import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function fromDB(row) {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    category: row.category,
    memo: row.memo || '',
    tags: row.tags || [],
    dayOfMonth: row.day_of_month,
  }
}

export function useRecurring() {
  const [recurringItems, setRecurringItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('recurring_items')
      .select('*')
      .then(({ data, error }) => {
        if (error) console.error('반복항목 로드 실패:', error)
        else setRecurringItems((data || []).map(fromDB))
      })
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
      day_of_month: Number(data.dayOfMonth) || 1,
    }
    const { data: created, error } = await supabase
      .from('recurring_items')
      .insert(newItem)
      .select()
      .single()
    if (error) throw error
    const item = fromDB(created)
    setRecurringItems(prev => [...prev, item])
    return item
  }, [])

  const updateRecurring = useCallback(async (id, data) => {
    const { data: row, error } = await supabase
      .from('recurring_items')
      .update({
        type: data.type,
        amount: Number(data.amount),
        category: data.category,
        memo: data.memo || '',
        tags: data.tags || [],
        day_of_month: Number(data.dayOfMonth),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setRecurringItems(prev => prev.map(item => item.id === id ? fromDB(row) : item))
  }, [])

  const deleteRecurring = useCallback(async (id) => {
    const { error } = await supabase.from('recurring_items').delete().eq('id', id)
    if (error) throw error
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
