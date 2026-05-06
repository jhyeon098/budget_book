const PREFIX = 'budget_book_'

export const KEYS = {
  TRANSACTIONS: `${PREFIX}transactions`,
  CATEGORIES: `${PREFIX}categories`,
  BUDGETS: `${PREFIX}budgets`,
  RECURRING: `${PREFIX}recurring`,
  INITIALIZED: `${PREFIX}initialized`,
}

export function getItem(key) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function clearAll() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key))
}
