import { useState, useCallback, useEffect } from 'react'
import { DEFAULT_CATEGORIES } from '../constants/categories.js'
import { supabase } from '../lib/supabase.js'

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function useCategories() {
  const [customCategories, setCustomCategories] = useState([])

  useEffect(() => {
    supabase
      .from('custom_categories')
      .select('*')
      .then(({ data, error }) => {
        if (error) console.error('카테고리 로드 실패:', error)
        else setCustomCategories(data || [])
      })
  }, [])

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]

  const addCategory = useCallback(async (data) => {
    const newCat = {
      id: `custom_${makeId()}`,
      name: data.name,
      type: data.type,
      icon: data.icon || (data.type === 'income' ? '💰' : '📌'),
    }
    const { data: created, error } = await supabase
      .from('custom_categories')
      .insert(newCat)
      .select()
      .single()
    if (error) throw error
    setCustomCategories(prev => [...prev, created])
    return created
  }, [])

  const deleteCategory = useCallback(async (id) => {
    const { error } = await supabase.from('custom_categories').delete().eq('id', id)
    if (error) throw error
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
