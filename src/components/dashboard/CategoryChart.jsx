import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '../../utils/formatters.js'
import { getCategoryName, CATEGORY_COLORS } from '../../constants/categories.js'
import EmptyState from '../common/EmptyState.jsx'

const RADIAN = Math.PI / 180

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function CategoryChart({ categoryExpenses, categories = [] }) {
  const total = Object.values(categoryExpenses || {}).reduce((s, v) => s + v, 0)

  const data = Object.entries(categoryExpenses || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([catId, amount], idx) => ({
      name: getCategoryName(catId, categories),
      value: amount,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      catId,
      pct: total > 0 ? (amount / total) * 100 : 0,
    }))

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">카테고리별 지출</div>
        </div>
        <EmptyState icon="🥧" title="지출 내역이 없습니다" description="이번달 지출을 추가해보세요" />
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">카테고리별 지출</div>
        <div className="card-subtitle">총 {formatCurrency(total)}원</div>
      </div>

      <div className="chart-container" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              dataKey="value"
              labelLine={false}
              label={CustomLabel}
            >
              {data.map((entry, index) => (
                <Cell key={entry.catId} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${formatCurrency(value)}원`, name]}
              contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        {data.map((item) => (
          <div key={item.catId} className="chart-legend-item">
            <div className="chart-legend-left">
              <span className="chart-legend-dot" style={{ background: item.color }} />
              <span className="chart-legend-name">{item.name}</span>
              <span className="chart-legend-pct">({item.pct.toFixed(1)}%)</span>
            </div>
            <span className="chart-legend-amount">{formatCurrency(item.value)}원</span>
          </div>
        ))}
      </div>
    </div>
  )
}
