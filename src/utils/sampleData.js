import { getCurrentMonth } from './formatters.js'

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function generateSampleData() {
  const month = getCurrentMonth()
  const [y, m] = month.split('-')

  const pad = (n) => String(n).padStart(2, '0')

  const d = (day) => `${y}-${m}-${pad(day)}`

  const recurringIds = {
    salary: `rec_salary`,
    rent: `rec_rent`,
    phone: `rec_phone`,
    netflix: `rec_netflix`,
  }

  const transactions = [
    {
      id: makeId(),
      date: d(1),
      type: 'income',
      amount: 3500000,
      category: 'inc_salary',
      memo: '3월 월급',
      tags: ['고정수입'],
      isRecurring: true,
      recurringId: recurringIds.salary,
      createdAt: new Date(`${d(1)}T09:00:00`).toISOString(),
    },
    {
      id: makeId(),
      date: d(2),
      type: 'expense',
      amount: 12000,
      category: 'exp_food',
      memo: '점심 식사',
      tags: ['점심'],
      isRecurring: false,
      recurringId: null,
      createdAt: new Date(`${d(2)}T12:30:00`).toISOString(),
    },
    {
      id: makeId(),
      date: d(3),
      type: 'expense',
      amount: 17500,
      category: 'exp_food',
      memo: '저녁 외식',
      tags: ['저녁', '외식'],
      isRecurring: false,
      recurringId: null,
      createdAt: new Date(`${d(3)}T19:00:00`).toISOString(),
    },
    {
      id: makeId(),
      date: d(5),
      type: 'expense',
      amount: 550000,
      category: 'exp_housing',
      memo: '월세',
      tags: ['고정지출'],
      isRecurring: true,
      recurringId: recurringIds.rent,
      createdAt: new Date(`${d(5)}T10:00:00`).toISOString(),
    },
    {
      id: makeId(),
      date: d(7),
      type: 'expense',
      amount: 13000,
      category: 'exp_transport',
      memo: '교통카드 충전',
      tags: ['교통'],
      isRecurring: false,
      recurringId: null,
      createdAt: new Date(`${d(7)}T08:00:00`).toISOString(),
    },
    {
      id: makeId(),
      date: d(8),
      type: 'expense',
      amount: 28000,
      category: 'exp_food',
      memo: '마트 장보기',
      tags: ['식료품'],
      isRecurring: false,
      recurringId: null,
      createdAt: new Date(`${d(8)}T16:00:00`).toISOString(),
    },
    {
      id: makeId(),
      date: d(10),
      type: 'income',
      amount: 50000,
      category: 'inc_allowance',
      memo: '용돈',
      tags: [],
      isRecurring: false,
      recurringId: null,
      createdAt: new Date(`${d(10)}T11:00:00`).toISOString(),
    },
    {
      id: makeId(),
      date: d(12),
      type: 'expense',
      amount: 45000,
      category: 'exp_shopping',
      memo: '의류 쇼핑',
      tags: ['옷'],
      isRecurring: false,
      recurringId: null,
      createdAt: new Date(`${d(12)}T14:00:00`).toISOString(),
    },
    {
      id: makeId(),
      date: d(15),
      type: 'expense',
      amount: 55000,
      category: 'exp_telecom',
      memo: '핸드폰 요금',
      tags: ['고정지출'],
      isRecurring: true,
      recurringId: recurringIds.phone,
      createdAt: new Date(`${d(15)}T09:00:00`).toISOString(),
    },
    {
      id: makeId(),
      date: d(20),
      type: 'expense',
      amount: 13900,
      category: 'exp_leisure',
      memo: '넷플릭스',
      tags: ['구독', '고정지출'],
      isRecurring: true,
      recurringId: recurringIds.netflix,
      createdAt: new Date(`${d(20)}T00:00:00`).toISOString(),
    },
  ]

  const recurring = [
    {
      id: recurringIds.salary,
      type: 'income',
      amount: 3500000,
      category: 'inc_salary',
      memo: '월급',
      tags: ['고정수입'],
      dayOfMonth: 1,
    },
    {
      id: recurringIds.rent,
      type: 'expense',
      amount: 550000,
      category: 'exp_housing',
      memo: '월세',
      tags: ['고정지출'],
      dayOfMonth: 5,
    },
    {
      id: recurringIds.phone,
      type: 'expense',
      amount: 55000,
      category: 'exp_telecom',
      memo: '핸드폰 요금',
      tags: ['고정지출'],
      dayOfMonth: 15,
    },
    {
      id: recurringIds.netflix,
      type: 'expense',
      amount: 13900,
      category: 'exp_leisure',
      memo: '넷플릭스',
      tags: ['구독', '고정지출'],
      dayOfMonth: 20,
    },
  ]

  const budgets = [
    { id: makeId(), month: month, category: 'exp_food', limitAmount: 300000 },
    { id: makeId(), month: month, category: 'exp_housing', limitAmount: 600000 },
    { id: makeId(), month: month, category: 'exp_shopping', limitAmount: 100000 },
    { id: makeId(), month: month, category: 'exp_transport', limitAmount: 50000 },
    { id: makeId(), month: month, category: 'exp_telecom', limitAmount: 60000 },
    { id: makeId(), month: month, category: 'exp_leisure', limitAmount: 50000 },
  ]

  return { transactions, recurring, budgets, categories: [] }
}
