import { useState, useEffect, useRef } from 'react'
import { getCurrentMonth } from './utils/formatters.js'
import { useTransactions } from './hooks/useTransactions.js'
import { useCategories } from './hooks/useCategories.js'
import { useBudget } from './hooks/useBudget.js'
import { useRecurring } from './hooks/useRecurring.js'
import Header from './components/layout/Header.jsx'
import Navigation from './components/layout/Navigation.jsx'
import Dashboard from './components/dashboard/Dashboard.jsx'
import TransactionList from './components/transactions/TransactionList.jsx'
import TransactionForm from './components/transactions/TransactionForm.jsx'
import BudgetManager from './components/budget/BudgetManager.jsx'
import RecurringManager from './components/recurring/RecurringManager.jsx'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [showForm, setShowForm] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const recurringApplied = useRef(false)

  const { categories, addCategory } = useCategories()

  const {
    transactions,
    loading: loadingTx,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurringTransactions,
    getMonthlySummary,
    getCategoryExpenses,
  } = useTransactions()

  const { budgets, setBudget, deleteBudget, getBudgetStatus } = useBudget()
  const { recurringItems, loading: loadingRec, addRecurring, updateRecurring, deleteRecurring } = useRecurring()

  // 거래 내역과 반복항목이 모두 로드된 후 현재 월 자동 등록
  useEffect(() => {
    if (!loadingTx && !loadingRec && !recurringApplied.current) {
      recurringApplied.current = true
      addRecurringTransactions(recurringItems, getCurrentMonth())
    }
  }, [loadingTx, loadingRec, recurringItems, addRecurringTransactions])

  const openAddForm = () => {
    setEditingTx(null)
    setShowForm(true)
  }

  const openEditForm = (tx) => {
    setEditingTx(tx)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingTx(null)
  }

  const handleFormSubmit = (data) => {
    if (editingTx) {
      updateTransaction(editingTx.id, data)
    } else {
      addTransaction(data)
    }
    closeForm()
  }

  return (
    <div className="app-layout">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onAddClick={openAddForm}
      />

      <main className="main-content">
        <Header onAddClick={openAddForm} />

        <div className="page-content">
          {currentPage === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              getMonthlySummary={getMonthlySummary}
              getCategoryExpenses={getCategoryExpenses}
              getBudgetStatus={getBudgetStatus}
              categories={categories}
              onNavigateBudget={() => setCurrentPage('budget')}
              onAddClick={openAddForm}
            />
          )}

          {currentPage === 'transactions' && (
            <TransactionList
              transactions={transactions}
              categories={categories}
              onEdit={openEditForm}
              onDelete={deleteTransaction}
              onAddClick={openAddForm}
            />
          )}

          {currentPage === 'budget' && (
            <BudgetManager
              categories={categories}
              getCategoryExpenses={getCategoryExpenses}
              getBudgetStatus={getBudgetStatus}
              onSetBudget={setBudget}
              onDeleteBudget={deleteBudget}
            />
          )}

          {currentPage === 'recurring' && (
            <RecurringManager
              recurringItems={recurringItems}
              categories={categories}
              onAdd={addRecurring}
              onUpdate={updateRecurring}
              onDelete={deleteRecurring}
            />
          )}
        </div>
      </main>

      {showForm && (
        <TransactionForm
          initialData={editingTx}
          categories={categories}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
          onAddCategory={addCategory}
        />
      )}
    </div>
  )
}
