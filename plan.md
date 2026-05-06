# 가계부 웹앱 구현 기획안

## 1. 프로젝트 개요

- 목적: 혼자 쓰는 개인 가계부 MVP
- 방식: 프론트엔드 단독 (서버/로그인 없음)
- 데이터: `db.json` 파일을 초기 데이터로 사용, 앱 실행 시 localStorage에 로드
- UI: 한국어, 깔끔한 카드형 반응형 디자인

---

## 2. 기술 스택

| 항목 | 선택 |
|------|------|
| 번들러 | Vite |
| UI 프레임워크 | React 18 |
| 차트 | Recharts (최소화) |
| 스타일 | 순수 CSS (CSS 변수 기반) |
| 데이터 저장 | localStorage (초기값: db.json) |
| 라우팅 | React state 기반 (React Router 없음) |

---

## 3. 폴더 구조

```
budget_book/
├── db.json                      ← 초기 샘플 데이터
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── constants/
    │   └── categories.js        ← 기본 카테고리 목록
    ├── utils/
    │   ├── storage.js           ← localStorage 읽기/쓰기
    │   ├── formatters.js        ← 금액/날짜 포맷
    │   └── csvExport.js         ← CSV 내보내기
    ├── hooks/
    │   ├── useTransactions.js   ← 거래 내역 상태
    │   ├── useCategories.js     ← 카테고리 상태
    │   ├── useBudget.js         ← 예산 상태
    │   └── useRecurring.js      ← 반복 항목 상태
    └── components/
        ├── layout/
        │   ├── Header.jsx
        │   └── Navigation.jsx   ← 사이드바(PC) / 하단 탭(모바일)
        ├── common/
        │   └── EmptyState.jsx   ← 데이터 없을 때 UI
        ├── dashboard/
        │   ├── Dashboard.jsx
        │   ├── SummaryCards.jsx
        │   ├── CategoryChart.jsx
        │   ├── BudgetOverview.jsx
        │   └── PatternAnalysis.jsx
        ├── transactions/
        │   ├── TransactionForm.jsx
        │   ├── TransactionList.jsx
        │   └── TransactionItem.jsx
        ├── budget/
        │   ├── BudgetManager.jsx
        │   └── BudgetItem.jsx
        └── recurring/
            ├── RecurringManager.jsx
            └── RecurringItem.jsx
```

---

## 4. 데이터 구조 (db.json 형식)

```json
{
  "transactions": [
    {
      "id": "tx_1",
      "date": "2026-04-01",
      "type": "income",
      "amount": 3500000,
      "category": "inc_salary",
      "memo": "4월 월급",
      "tags": ["고정수입"],
      "isRecurring": true,
      "recurringId": "rec_salary",
      "createdAt": "2026-04-01T00:00:00.000Z"
    }
  ],
  "categories": [
    { "id": "exp_food",      "name": "식비",  "type": "expense" },
    { "id": "exp_transport", "name": "교통",  "type": "expense" },
    { "id": "exp_shopping",  "name": "쇼핑",  "type": "expense" },
    { "id": "exp_housing",   "name": "주거",  "type": "expense" },
    { "id": "exp_telecom",   "name": "통신",  "type": "expense" },
    { "id": "exp_medical",   "name": "의료",  "type": "expense" },
    { "id": "exp_leisure",   "name": "여가",  "type": "expense" },
    { "id": "exp_other",     "name": "기타",  "type": "expense" },
    { "id": "inc_salary",    "name": "월급",  "type": "income"  },
    { "id": "inc_allowance", "name": "용돈",  "type": "income"  },
    { "id": "inc_refund",    "name": "환급",  "type": "income"  },
    { "id": "inc_other",     "name": "기타",  "type": "income"  }
  ],
  "budgets": [
    { "id": "bud_1", "month": "2026-04", "category": "exp_food",     "limitAmount": 300000 },
    { "id": "bud_2", "month": "2026-04", "category": "exp_housing",  "limitAmount": 600000 },
    { "id": "bud_3", "month": "2026-04", "category": "exp_shopping", "limitAmount": 100000 },
    { "id": "bud_4", "month": "2026-04", "category": "exp_transport","limitAmount": 50000  },
    { "id": "bud_5", "month": "2026-04", "category": "exp_telecom",  "limitAmount": 60000  },
    { "id": "bud_6", "month": "2026-04", "category": "exp_leisure",  "limitAmount": 50000  }
  ],
  "recurringItems": [
    { "id": "rec_salary",  "type": "income",  "amount": 3500000, "category": "inc_salary",   "memo": "월급",       "tags": ["고정수입"], "dayOfMonth": 1  },
    { "id": "rec_rent",    "type": "expense", "amount": 550000,  "category": "exp_housing",  "memo": "월세",       "tags": ["고정비"],  "dayOfMonth": 5  },
    { "id": "rec_phone",   "type": "expense", "amount": 55000,   "category": "exp_telecom",  "memo": "핸드폰 요금","tags": ["고정비"],  "dayOfMonth": 15 },
    { "id": "rec_netflix", "type": "expense", "amount": 13900,   "category": "exp_leisure",  "memo": "넷플릭스",   "tags": ["구독","고정비"], "dayOfMonth": 20 }
  ]
}
```

---

## 5. 화면 구성 (5개 페이지)

### 5-1. 대시보드
- 이번 달 총수입 / 총지출 / 잔액 카드 (지난달 대비 증감 표시)
- 카테고리별 지출 비율 파이차트 (퍼센트 + 금액)
- 예산 현황 요약 (카테고리별 진행바)
- 패턴 분석 요약
  - 가장 지출 많은 카테고리
  - 가장 많이 지출한 요일
  - 이번 달 고정지출 합계

### 5-2. 거래 목록
- 기간 필터 (이번 달 / 지난 달 / 전체)
- 유형 필터 (전체 / 수입 / 지출)
- 카테고리 필터
- 검색창 (메모 or 카테고리)
- CSV 내보내기 버튼
- 거래 카드 리스트 (수정 / 삭제 가능)

### 5-3. 거래 입력 (모달)
- 날짜
- 수입 / 지출 토글
- 금액 (숫자 입력 → 천단위 자동 포맷)
- 카테고리 선택 + 직접 추가 가능
- 메모
- 태그 (칩 형태, 여러 개)
- 반복 여부 (반복 시 dayOfMonth 입력)
- 저장 / 취소

### 5-4. 예산 관리
- 월 선택기
- 지출 카테고리별 예산 금액 입력
- 사용 금액 / 잔여 금액 / 진행바
- 초과 시 빨간색 경고 표시

### 5-5. 반복 항목
- 반복 항목 카드 리스트
- 추가 / 수정 / 삭제
- 매월 몇 일에 자동 등록될지 표시

---

## 6. 구현 단계

### Phase 1 — 프로젝트 셋업
- [ ] package.json, vite.config.js, index.html 생성
- [ ] db.json 생성 (샘플 데이터)
- [ ] src/index.css 작성 (디자인 시스템)
- [ ] src/main.jsx, src/App.jsx 기본 틀

### Phase 2 — 유틸리티 & 상수
- [ ] src/constants/categories.js
- [ ] src/utils/storage.js (localStorage 읽기/쓰기 + db.json 초기화)
- [ ] src/utils/formatters.js (금액 포맷, 날짜 포맷, 월 계산)
- [ ] src/utils/csvExport.js

### Phase 3 — 커스텀 훅
- [ ] useCategories.js
- [ ] useTransactions.js (CRUD + 반복 항목 자동 등록)
- [ ] useBudget.js
- [ ] useRecurring.js

### Phase 4 — 레이아웃 & 공통 컴포넌트
- [ ] Header.jsx
- [ ] Navigation.jsx (사이드바 PC / 하단탭 모바일)
- [ ] EmptyState.jsx

### Phase 5 — 대시보드
- [ ] SummaryCards.jsx
- [ ] CategoryChart.jsx (Recharts PieChart)
- [ ] BudgetOverview.jsx
- [ ] PatternAnalysis.jsx
- [ ] Dashboard.jsx (조합)

### Phase 6 — 거래 기능
- [ ] TransactionItem.jsx
- [ ] TransactionList.jsx (필터 + 검색 + CSV)
- [ ] TransactionForm.jsx (모달, 입력 검증)

### Phase 7 — 예산 & 반복 항목
- [ ] BudgetItem.jsx
- [ ] BudgetManager.jsx
- [ ] RecurringItem.jsx
- [ ] RecurringManager.jsx

### Phase 8 — App.jsx 통합 & 마무리
- [ ] App.jsx에서 모든 hook, page 연결
- [ ] 반복항목 자동 등록 로직 (useEffect, 중복 방지)
- [ ] 빈 상태 UI 확인
- [ ] 반응형 UI 확인 (모바일/PC)

---

## 7. 핵심 로직 메모

### 반복항목 자동 등록
```
앱 마운트 시:
  현재 월(YYYY-MM) 가져오기
  recurringItems 순회
  → 같은 recurringId + 같은 월의 transaction이 없으면 생성
  → 있으면 스킵 (중복 방지)
```

### 금액 입력 포맷
```
onChange: 숫자만 추출 → toLocaleString('ko-KR')으로 표시
저장 시: 쉼표 제거 → parseInt()
```

### localStorage 초기화
```
앱 최초 실행 시:
  localStorage에 'budget_book_initialized' 키가 없으면
  → db.json 데이터를 localStorage에 저장
  → 'budget_book_initialized' = true 설정
```

### CSV 내보내기
```
헤더: 날짜, 구분, 금액, 카테고리, 메모, 태그
인코딩: UTF-8 BOM (﻿) 포함 (Excel 한글 깨짐 방지)
```

---

## 8. 디자인 시스템

| 변수 | 값 | 용도 |
|------|----|------|
| --primary | #4F46E5 | 버튼, 링크, 포커스 |
| --income | #10B981 | 수입 금액, 배지 |
| --expense | #EF4444 | 지출 금액, 배지 |
| --bg | #F3F4F6 | 배경 |
| --card | #FFFFFF | 카드 배경 |
| --border | #E5E7EB | 테두리 |
| --text | #111827 | 본문 텍스트 |
| --text-secondary | #6B7280 | 보조 텍스트 |

---

## 9. 실행 방법

```bash
cd budget_book
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속
