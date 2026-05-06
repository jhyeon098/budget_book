import { getCategoryName } from '../constants/categories.js'
import { formatDate } from './formatters.js'

/**
 * 거래 내역을 CSV 파일로 내보내기 (BOM 포함)
 */
export function exportTransactionsToCSV(transactions, categories = []) {
  const headers = ['날짜', '구분', '금액', '카테고리', '메모', '태그', '반복여부']

  const rows = transactions.map(tx => {
    const type = tx.type === 'income' ? '수입' : '지출'
    const catName = getCategoryName(tx.category, categories)
    const tags = (tx.tags || []).join(', ')
    const isRec = tx.isRecurring ? '반복' : ''
    const date = formatDate(tx.date) || tx.date
    return [
      `"${date}"`,
      `"${type}"`,
      tx.amount,
      `"${catName}"`,
      `"${(tx.memo || '').replace(/"/g, '""')}"`,
      `"${tags}"`,
      `"${isRec}"`,
    ].join(',')
  })

  const BOM = '﻿'
  const csvContent = BOM + [headers.join(','), ...rows].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const filename = `가계부_${dateStr}.csv`

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
