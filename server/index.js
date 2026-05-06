import express from 'express'
import cors from 'cors'
import transactionsRouter from './routes/transactions.js'
import categoriesRouter from './routes/categories.js'
import budgetsRouter from './routes/budgets.js'
import recurringRouter from './routes/recurring.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.use('/api/transactions', transactionsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/budgets', budgetsRouter)
app.use('/api/recurring', recurringRouter)

app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`)
})
