import { Router } from 'express'
import db from '../db.js'

const router = Router()

function parse(row) {
  if (!row) return null
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]'),
    isRecurring: Boolean(row.isRecurring),
  }
}

router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM transactions ORDER BY date DESC, createdAt DESC'
  ).all()
  res.json(rows.map(parse))
})

router.post('/', (req, res) => {
  const tx = req.body
  db.prepare(`
    INSERT INTO transactions (id, date, type, amount, category, memo, tags, isRecurring, recurringId, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    tx.id,
    tx.date,
    tx.type,
    Number(tx.amount),
    tx.category,
    tx.memo || '',
    JSON.stringify(tx.tags || []),
    tx.isRecurring ? 1 : 0,
    tx.recurringId || null,
    tx.createdAt || new Date().toISOString()
  )
  res.status(201).json(parse(db.prepare('SELECT * FROM transactions WHERE id = ?').get(tx.id)))
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const tx = req.body
  db.prepare(`
    UPDATE transactions
    SET date=?, type=?, amount=?, category=?, memo=?, tags=?, isRecurring=?, recurringId=?
    WHERE id=?
  `).run(
    tx.date,
    tx.type,
    Number(tx.amount),
    tx.category,
    tx.memo || '',
    JSON.stringify(tx.tags || []),
    tx.isRecurring ? 1 : 0,
    tx.recurringId || null,
    id
  )
  res.json(parse(db.prepare('SELECT * FROM transactions WHERE id = ?').get(id)))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

export default router
