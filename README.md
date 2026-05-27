# 가계부 (budget_book)

혼자 쓰는 개인 가계부 MVP. Vite + React 18 기반 SPA이며 데이터는 Supabase(Postgres)에 저장됩니다.

## 주요 기능

- 수입/지출 입력, 카테고리/태그/메모, 천단위 자동 포맷
- 거래 목록 — 기간 / 유형 / 카테고리 필터 + 메모·카테고리 검색
- 월별 총수입/총지출/잔액 + 지난달 대비 증감
- 카테고리별 지출 비율 파이차트
- 카테고리별 월 예산 설정 및 사용률 / 초과 경고
- 매월 자동 반영되는 반복 수입·지출
- 지출 패턴 분석 (최다 지출 카테고리, 요일별, 고정지출 합계)
- 거래 내역 CSV 내보내기 (UTF-8 BOM, Excel 한글 호환)

## 폴더 구조

```
budget_book/
├── index.html
├── vite.config.js
├── package.json
├── .env.example
└── src/
    ├── main.jsx, App.jsx, index.css
    ├── lib/supabase.js          Supabase 클라이언트
    ├── constants/categories.js  기본 카테고리 + 색상 팔레트
    ├── utils/                   formatters, csvExport, sampleData
    ├── hooks/                   useTransactions, useCategories, useBudget, useRecurring
    └── components/
        ├── layout/              Header, Navigation
        ├── common/              EmptyState
        ├── dashboard/           Dashboard, SummaryCards, CategoryChart, BudgetOverview, PatternAnalysis
        ├── transactions/        TransactionList, TransactionItem, TransactionForm
        ├── budget/              BudgetManager, BudgetItem
        └── recurring/           RecurringManager, RecurringItem
```

## 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 — .env.example을 참고해서 .env 파일 생성
cp .env.example .env
# .env 안의 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY를 본인 프로젝트 값으로 채우기

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 <http://localhost:5173> 접속.

## Supabase 스키마

다음 테이블이 필요합니다.

| 테이블 | 컬럼 |
|---|---|
| `transactions` | `id` (text, PK), `date` (date), `type` (text), `amount` (int8), `category` (text), `memo` (text), `tags` (text[]), `is_recurring` (bool), `recurring_id` (text, nullable), `created_at` (timestamptz) |
| `custom_categories` | `id` (text, PK), `name` (text), `type` (text), `icon` (text) |
| `budgets` | `id` (text, PK), `month` (text, e.g. `2026-05`), `category` (text), `limit_amount` (int8), UNIQUE(`month`, `category`) |
| `recurring_items` | `id` (text, PK), `type` (text), `amount` (int8), `category` (text), `memo` (text), `tags` (text[]), `day_of_month` (int) |

**중요:** Supabase 콘솔에서 각 테이블의 RLS(Row Level Security)를 반드시 활성화하세요. 이 앱은 anon 키를 브라우저에서 사용하므로, RLS가 꺼져 있으면 누구나 본인 데이터를 읽고 쓸 수 있습니다.

## 데이터 모델 메모

- 모든 식별자는 클라이언트가 `crypto.randomUUID()`로 생성합니다.
- `transactions.date`는 ISO `YYYY-MM-DD` 문자열입니다.
- 반복항목 자동 등록은 앱 마운트 시 한 번만 실행되며, 동일 `recurring_id` + 같은 월의 행이 DB에 이미 존재하면 스킵합니다 (멀티 탭 중복 방지).

## 빌드

```bash
npm run build      # dist/ 에 정적 빌드
npm run preview    # dist/ 미리보기
```

## 라이선스

개인 프로젝트.
