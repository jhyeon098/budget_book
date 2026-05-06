import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM custom_categories').all()
  res.json(rows)
})

router.post('/', (req, res) => {
  const { id, name, type, icon } = req.body
  db.prepare('INSERT INTO custom_categories (id, name, type, icon) VALUES (?, ?, ?, ?)')
    .run(id, name, type, icon || '📌')
  res.status(201).json({ id, name, type, icon: icon || '📌' })
})

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM custom_categories WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

export default router
