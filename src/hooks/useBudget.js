import { useState, useCallback, useEffect } from 'react'

export function useBudget() {
  const [budgets, setBudgets] = useState([])

  useEffect(() => {
    fetch('/api/budgets')
      .then(r => r.json())
      .then(setBudgets)
      .catch(err => console.error('예산 로드 실패:', err))
  }, [])

  const getByMonth = useCallback((yearMonth) => {
    return budgets.filter(b => b.month === yearMonth)
  }, [budgets])

  const getBudgetForCategory = useCallback((yearMonth, categoryId) => {
    return budgets.find(b => b.month === yearMonth && b.category === categoryId) || null
  }, [budgets])

  const setBudget = useCallback(async (yearMonth, categoryId, limitAmount) => {
    const res = await fetch(`/api/budgets/${yearMonth}/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limitAmount: Number(limitAmount) }),
    })
    const updated = await res.json()
    setBudgets(prev => {
      const idx = prev.findIndex(b => b.month === yearMonth && b.category === categoryId)
      return idx >= 0 ? prev.map((b, i) => i === idx ? updated : b) : [...prev, updated]
    })
  }, [])

  const deleteBudget = useCallback(async (id) => {
    await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
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
