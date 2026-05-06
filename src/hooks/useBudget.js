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
    month: row.month,
    category: row.category,
    limitAmount: row.limit_amount,
  }
}

export function useBudget() {
  const [budgets, setBudgets] = useState([])

  useEffect(() => {
    supabase
      .from('budgets')
      .select('*')
      .then(({ data, error }) => {
        if (error) console.error('예산 로드 실패:', error)
        else setBudgets((data || []).map(fromDB))
      })
  }, [])

  const getByMonth = useCallback((yearMonth) => {
    return budgets.filter(b => b.month === yearMonth)
  }, [budgets])

  const getBudgetForCategory = useCallback((yearMonth, categoryId) => {
    return budgets.find(b => b.month === yearMonth && b.category === categoryId) || null
  }, [budgets])

  const setBudget = useCallback(async (yearMonth, categoryId, limitAmount) => {
    const existing = budgets.find(b => b.month === yearMonth && b.category === categoryId)

    if (existing) {
      const { data: row, error } = await supabase
        .from('budgets')
        .update({ limit_amount: Number(limitAmount) })
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      setBudgets(prev => prev.map(b => b.id === existing.id ? fromDB(row) : b))
    } else {
      const { data: row, error } = await supabase
        .from('budgets')
        .insert({ id: makeId(), month: yearMonth, category: categoryId, limit_amount: Number(limitAmount) })
        .select()
        .single()
      if (error) throw error
      setBudgets(prev => [...prev, fromDB(row)])
    }
  }, [budgets])

  const deleteBudget = useCallback(async (id) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) throw error
    setBudgets(prev => prev.filter(b => b.id !== id))
  }, [])

  const getBudgetStatus = useCallback((yearMonth, categoryExpenses) => {
    return getByMonth(yearMonth).map(budget => {
      const used = categoryExpenses[budget.category] || 0
      const remaining = budget.limitAmount - used
      const percent = budget.limitAmount > 0
        ? Math.min(Math.round((used / budget.limitAmount) * 100), 100)
        : 0
      return { ...budget, used, remaining, percent, isOver: used > budget.limitAmount }
    })
  }, [getByMonth])

  return {
    budgets,
    getByMonth,
    getBudgetForCategory,
    setBudget,
    deleteBudget,
    getBudgetStatus,
  }
}
