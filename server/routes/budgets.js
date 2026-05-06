import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM budgets').all()
  res.json(rows)
})

// upsert: PUT /api/budgets/:month/:category
router.put('/:month/:category', (req, res) => {
  const { month, category } = req.params
  const { limitAmount } = req.body

  const existing = db.prepare(
    'SELECT * FROM budgets WHERE month = ? AND category = ?'
  ).get(month, category)

  if (existing) {
    db.prepare('UPDATE budgets SET limitAmount = ? WHERE month = ? AND category = ?')
      .run(Number(limitAmount), month, category)
    res.json({ ...existing, limitAmount: Number(limitAmount) })
  } else {
    const id = `bud_${Date.now()}`
    db.prepare('INSERT INTO budgets (id, month, category, limitAmount) VALUES (?, ?, ?, ?)')
      .run(id, month, category, Number(limitAmount))
    res.status(201).json({ id, month, category, limitAmount: Number(limitAmount) })
  }
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM budgets WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

export default router
