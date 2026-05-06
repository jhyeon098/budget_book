import { useState, useCallback, useEffect } from 'react'
import { DEFAULT_CATEGORIES } from '../constants/categories.js'

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function useCategories() {
  const [customCategories, setCustomCategories] = useState([])

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCustomCategories)
      .catch(err => console.error('카테고리 로드 실패:', err))
  }, [])

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]

  const addCategory = useCallback(async (data) => {
    const newCat = {
      id: `custom_${makeId()}`,
      name: data.name,
      type: data.type,
      icon: data.icon || (data.type === 'income' ? '💰' : '📌'),
    }
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    })
    const created = await res.json()
    setCustomCategories(prev => [...prev, created])
    return created
  }, [])

  const deleteCategory = useCallback(async (id) => {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setCustomCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  const getCategoriesByType = useCallback((type) => {
    return allCategories.filter(c => c.type === type)
  }, [allCategories])

  const getCategoryById = useCallback((id) => {
    return allCategories.find(c => c.id === id) || null
  }, [allCategories])

  return {
    categories: allCategories,
    customCategories,
    addCategory,
    deleteCategory,
    getCategoriesByType,
    getCategoryById,
  }
}
