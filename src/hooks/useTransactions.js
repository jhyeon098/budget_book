import { useState, useCallback, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase.js'

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function fromDB(row) {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    amount: row.amount,
    category: row.category,
    memo: row.memo || '',
    tags: row.tags || [],
    isRecurring: row.is_recurring,
    recurringId: row.recurring_id,
    createdAt: row.created_at,
  }
}

function toDB(data) {
  return {
    id: data.id,
    date: data.date,
    type: data.type,
    amount: data.amount,
    category: data.category,
    memo: data.memo || '',
    tags: data.tags || [],
    is_recurring: data.isRecurring || false,
    recurring_id: data.recurringId || null,
    created_at: data.createdAt,
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('거래 내역 로드 실패:', error)
        else setTransactions((data || []).map(fromDB))
      })
      .finally(() => setLoading(false))
  }, [])

  const addTransaction = useCallback(async (data) => {
    const newTx = {
      id: makeId(),
      date: data.date,
      type: data.type,
      amount: Number(data.amount),
      category: data.category,
      memo: data.memo || '',
      tags: data.tags || [],
      isRecurring: data.isRecurring || false,
      recurringId: data.recurringId || null,
      createdAt: new Date().toISOString(),
    }
    const { data: created, error } = await supabase
      .from('transactions')
      .insert(toDB(newTx))
      .select()
      .single()
    if (error) throw error
    const tx = fromDB(created)
    setTransactions(prev =>
      [tx, ...prev].sort((a, b) =>
        b.date.localeCompare(a.date) || new Date(b.createdAt) - new Date(a.createdAt)
      )
    )
    return tx
  }, [])

  const updateTransaction = useCallback(async (id, data) => {
    const { data: row, error } = await supabase
      .from('transactions')
      .update({
        date: data.date,
        type: data.type,
        amount: Number(data.amount),
        category: data.category,
        memo: data.memo || '',
        tags: data.tags || [],
        is_recurring: data.isRecurring || false,
        recurring_id: data.recurringId || null,
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setTransactions(prev => prev.map(t => t.id === id ? fromDB(row) : t))
  }, [])

  const deleteTransaction = useCallback(async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    setTransactions(prev => prev.filter(tx => tx.id !== id))
  }, [])

  const addRecurringTransactions = useCallback(async (recurringItems, yearMonth) => {
    const toAdd = recurringItems.filter(item =>
      !transactions.some(tx => tx.recurringId === item.id && tx.date.startsWith(yearMonth))
    ).map(item => {
      const [y, m] = yearMonth.split('-')
      return {
        id: makeId(),
        date: `${y}-${m}-${String(item.dayOfMonth).padStart(2, '0')}`,
        type: item.type,
        amount: Number(item.amount),
        category: item.category,
        memo: item.memo || '',
        tags: item.tags || [],
        isRecurring: true,
        recurringId: item.id,
        createdAt: new Date().toISOString(),
      }
    })

    if (toAdd.length === 0) return 0

    const { data: rows, error } = await supabase
      .from('transactions')
      .insert(toAdd.map(toDB))
      .select()
    if (error) throw error
    const results = (rows || []).map(fromDB)
    setTransactions(prev =>
      [...prev, ...results].sort((a, b) => b.date.localeCompare(a.date))
    )
    return results.length
  }, [transactions])

  const getByMonth = useCallback((yearMonth) => {
    return transactions.filter(tx => tx.date.startsWith(yearMonth))
  }, [transactions])

  const getMonthlySummary = useCallback((yearMonth) => {
    const list = getByMonth(yearMonth)
    const income = list.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
    const expense = list.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
    return { income, expense, balance: income - expense, count: list.length }
  }, [getByMonth])

  const getCategoryExpenses = useCallback((yearMonth) => {
    const map = {}
    getByMonth(yearMonth)
      .filter(t => t.type === 'expense')
      .forEach(tx => { map[tx.category] = (map[tx.category] || 0) + (tx.amount || 0) })
    return map
  }, [getByMonth])

  const getDayOfWeekExpenses = useCallback((yearMonth) => {
    const days = ['일', '월', '화', '수', '목', '금', '토']
    const map = { '일': 0, '월': 0, '화': 0, '수': 0, '목': 0, '금': 0, '토': 0 }
    getByMonth(yearMonth)
      .filter(t => t.type === 'expense')
      .forEach(tx => { map[days[new Date(tx.date).getDay()]] += tx.amount || 0 })
    return map
  }, [getByMonth])

  const sortedTransactions = useMemo(() =>
    [...transactions].sort((a, b) =>
      b.date.localeCompare(a.date) ||
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    ),
    [transactions]
  )

  return {
    transactions: sortedTransactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurringTransactions,
    getByMonth,
    getMonthlySummary,
    getCategoryExpenses,
    getDayOfWeekExpenses,
  }
}
