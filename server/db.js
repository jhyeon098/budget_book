import { DatabaseSync } from 'node:sqlite'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new DatabaseSync(join(__dirname, '../data.sqlite'))

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id          TEXT PRIMARY KEY,
    date        TEXT NOT NULL,
    type        TEXT NOT NULL,
    amount      INTEGER NOT NULL,
    category    TEXT NOT NULL,
    memo        TEXT DEFAULT '',
    tags        TEXT DEFAULT '[]',
    isRecurring INTEGER DEFAULT 0,
    recurringId TEXT,
    createdAt   TEXT
  );

  CREATE TABLE IF NOT EXISTS custom_categories (
    id   TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    icon TEXT DEFAULT '📌'
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id          TEXT PRIMARY KEY,
    month       TEXT NOT NULL,
    category    TEXT NOT NULL,
    limitAmount INTEGER NOT NULL,
    UNIQUE(month, category)
  );

  CREATE TABLE IF NOT EXISTS recurring_items (
    id         TEXT PRIMARY KEY,
    type       TEXT NOT NULL,
    amount     INTEGER NOT NULL,
    category   TEXT NOT NULL,
    memo       TEXT DEFAULT '',
    tags       TEXT DEFAULT '[]',
    dayOfMonth INTEGER NOT NULL
  );
`)

// 최초 실행 시 샘플 데이터 삽입
function seedIfEmpty() {
  const row = db.prepare('SELECT COUNT(*) as count FROM transactions').get()
  if (row.count > 0) return

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const monthStr = `${year}-${month}`
  const d = (day) => `${year}-${month}-${String(day).padStart(2, '0')}`
  const iso = new Date().toISOString()

  // 반복 항목 삽입
  const insertRec = db.prepare(
    'INSERT INTO recurring_items (id, type, amount, category, memo, tags, dayOfMonth) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  db.exec('BEGIN')
  for (const [id, type, amount, cat, memo, tags, day] of [
    ['rec_salary',  'income',  3500000, 'inc_salary',  '월급',        JSON.stringify(['고정수입']),        1 ],
    ['rec_rent',    'expense', 550000,  'exp_housing', '월세',        JSON.stringify(['고정지출']),        5 ],
    ['rec_phone',   'expense', 55000,   'exp_telecom', '핸드폰 요금', JSON.stringify(['고정지출']),        15],
    ['rec_netflix', 'expense', 13900,   'exp_leisure', '넷플릭스',    JSON.stringify(['구독','고정지출']), 20],
  ]) insertRec.run(id, type, amount, cat, memo, tags, day)
  db.exec('COMMIT')

  // 거래 내역 삽입
  const insertTx = db.prepare(
    'INSERT INTO transactions (id, date, type, amount, category, memo, tags, isRecurring, recurringId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
  db.exec('BEGIN')
  for (const [id, date, type, amount, cat, memo, tags, isRec, recId] of [
    ['s1',  d(1),  'income',  3500000, 'inc_salary',   '월급',          JSON.stringify(['고정수입']),         1, 'rec_salary' ],
    ['s2',  d(2),  'expense', 12000,   'exp_food',     '점심 식사',     JSON.stringify(['점심']),             0, null        ],
    ['s3',  d(3),  'expense', 17500,   'exp_food',     '저녁 외식',     JSON.stringify(['저녁','외식']),      0, null        ],
    ['s4',  d(5),  'expense', 550000,  'exp_housing',  '월세',          JSON.stringify(['고정지출']),         1, 'rec_rent'  ],
    ['s5',  d(7),  'expense', 13000,   'exp_transport','교통카드 충전', JSON.stringify(['교통']),             0, null        ],
    ['s6',  d(8),  'expense', 28000,   'exp_food',     '마트 장보기',   JSON.stringify(['식료품']),           0, null        ],
    ['s7',  d(10), 'income',  50000,   'inc_allowance','용돈',          JSON.stringify([]),                   0, null        ],
    ['s8',  d(12), 'expense', 45000,   'exp_shopping', '의류 쇼핑',     JSON.stringify(['옷']),               0, null        ],
    ['s9',  d(15), 'expense', 55000,   'exp_telecom',  '핸드폰 요금',  JSON.stringify(['고정지출']),         1, 'rec_phone' ],
    ['s10', d(20), 'expense', 13900,   'exp_leisure',  '넷플릭스',      JSON.stringify(['구독','고정지출']),  1, 'rec_netflix'],
  ]) insertTx.run(id, date, type, amount, cat, memo, tags, isRec, recId, iso)
  db.exec('COMMIT')

  // 예산 삽입
  const insertBudget = db.prepare(
    'INSERT INTO budgets (id, month, category, limitAmount) VALUES (?, ?, ?, ?)'
  )
  db.exec('BEGIN')
  for (const [id, cat, limit] of [
    ['b1', 'exp_food',      300000],
    ['b2', 'exp_housing',   600000],
    ['b3', 'exp_shopping',  100000],
    ['b4', 'exp_transport',  50000],
    ['b5', 'exp_telecom',    60000],
    ['b6', 'exp_leisure',    50000],
  ]) insertBudget.run(id, monthStr, cat, limit)
  db.exec('COMMIT')

  console.log('✅ 샘플 데이터 삽입 완료')
}

seedIfEmpty()

export default db
