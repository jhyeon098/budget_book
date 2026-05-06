import { Router } from 'express'
import db from '../db.js'

const router = Router()

function parse(row) {
  if (!row) return null
  return { ...row, tags: JSON.parse(row.tags || '[]') }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM recurring_items ORDER BY dayOfMonth ASC').all()
  res.json(rows.map(parse))
})

router.post('/', (req, res) => {
  const item = req.body
  db.prepare(`
    INSERT INTO recurring_items (id, type, amount, category, memo, tags, dayOfMonth)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    item.id,
    item.type,
    Number(item.amount),
    item.category,
    item.memo || '',
    JSON.stringify(item.tags || []),
    Number(item.dayOfMonth)
  )
  res.status(201).json(parse(db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(item.id)))
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const item = req.body
  db.prepare(`
    UPDATE recurring_items
    SET type=?, amount=?, category=?, memo=?, tags=?, dayOfMonth=?
    WHERE id=?
  `).run(
    item.type,
    Number(item.amount),
    item.category,
    item.memo || '',
    JSON.stringify(item.tags || []),
    Number(item.dayOfMonth),
    id
  )
  res.json(parse(db.prepare('SELECT * FROM recurring_items WHERE id = ?').get(id)))
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM recurring_items WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

export default router
