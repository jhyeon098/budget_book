export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'exp_food', name: '식비', type: 'expense', icon: '🍽️' },
  { id: 'exp_transport', name: '교통', type: 'expense', icon: '🚌' },
  { id: 'exp_shopping', name: '쇼핑', type: 'expense', icon: '🛍️' },
  { id: 'exp_housing', name: '주거', type: 'expense', icon: '🏠' },
  { id: 'exp_telecom', name: '통신', type: 'expense', icon: '📱' },
  { id: 'exp_medical', name: '의료', type: 'expense', icon: '🏥' },
  { id: 'exp_leisure', name: '여가', type: 'expense', icon: '🎮' },
  { id: 'exp_other', name: '기타', type: 'expense', icon: '📦' },
]

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'inc_salary', name: '월급', type: 'income', icon: '💰' },
  { id: 'inc_allowance', name: '용돈', type: 'income', icon: '🎁' },
  { id: 'inc_refund', name: '환급', type: 'income', icon: '💸' },
  { id: 'inc_other', name: '기타', type: 'income', icon: '📥' },
]

export const DEFAULT_CATEGORIES = [
  ...DEFAULT_INCOME_CATEGORIES,
  ...DEFAULT_EXPENSE_CATEGORIES,
]

export const CATEGORY_COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#EC4899',
  '#14B8A6', '#84CC16', '#6366F1', '#0EA5E9',
  '#A78BFA', '#34D399', '#FB923C', '#F43F5E',
]

export function getCategoryIcon(categoryId, categories = []) {
  const cat = [...DEFAULT_CATEGORIES, ...categories].find(c => c.id === categoryId)
  if (!cat) return '📌'
  return cat.icon || (cat.type === 'income' ? '💰' : '📌')
}

export function getCategoryName(categoryId, categories = []) {
  const cat = [...DEFAULT_CATEGORIES, ...categories].find(c => c.id === categoryId)
  return cat ? cat.name : '미분류'
}

export function getCategoryColor(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}
