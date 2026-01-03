import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, Plus, X, Tag as TagIcon } from 'lucide-react';

export default function ExpenseBreakdown({ transactions }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [viewMode, setViewMode] = useState('location'); // 'location' or 'tag'

  // 利用可能な年月を抽出
  const availablePeriods = useMemo(() => {
    const years = new Set();
    const months = new Set();
    transactions.forEach(t => {
      years.add(t.date.slice(0, 4));
      months.add(t.date.slice(5, 7));
    });
    return {
      years: Array.from(years).sort((a, b) => b.localeCompare(a)),
      months: Array.from(months).sort()
    };
  }, [transactions]);

  // フィルター済みトランザクション
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (selectedYear) {
      filtered = filtered.filter(t => t.date.startsWith(selectedYear));
    }
    if (selectedMonth) {
      filtered = filtered.filter(t => t.date.slice(5, 7) === selectedMonth);
    }
    return filtered;
  }, [transactions, selectedYear, selectedMonth]);

  // 場所別集計
  const allLocationData = useMemo(() => {
    const expenseMap = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      expenseMap[t.location] = (expenseMap[t.location] || 0) + t.amount;
    });
    return Object.entries(expenseMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // タグ別集計
  const allTagData = useMemo(() => {
    const tagMap = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      if (t.tags && t.tags.length > 0) {
        t.tags.forEach(tag => {
          if (!tagMap[tag.id]) {
            tagMap[tag.id] = { name: tag.name, value: 0, color: tag.color };
          }
          tagMap[tag.id].value += t.amount;
        });
      }
    });
    return Object.values(tagMap).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const displayData = viewMode === 'location' ? allLocationData : allTagData;
  const totalExpense = displayData.reduce((sum, item) => sum + item.value, 0);

  const COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#FF2D55', '#AF52DE', '#5AC8FA', '#FFCC00', '#FF6482', '#00C7BE', '#30D158', '#BF5AF2', '#FFD60A'];

  return (
    <div className="card">
      <div className="card-title"><TrendingDown size={20} color="var(--expense)" />支出の内訳</div>

      {/* 表示モード切り替え */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setViewMode('location')}
          style={{
            flex: 1,
            padding: '10px',
            background: viewMode === 'location' ? 'var(--primary)' : 'var(--bg-elevated)',
            color: viewMode === 'location' ? 'white' : 'var(--text-main)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          場所別
        </button>
        <button
          onClick={() => setViewMode('tag')}
          style={{
            flex: 1,
            padding: '10px',
            background: viewMode === 'tag' ? 'var(--primary)' : 'var(--bg-elevated)',
            color: viewMode === 'tag' ? 'white' : 'var(--text-main)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <TagIcon size={14} />
          タグ別
        </button>
      </div>

      {/* 年月フィルター */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <select className="input-field" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ flex: 1, marginBottom: 0 }}>
          <option value="">全期間</option>
          {availablePeriods.years.map(year => (
            <option key={year} value={year}>{year}年</option>
          ))}
        </select>
        <select className="input-field" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ flex: 1, marginBottom: 0 }}>
          <option value="">全月</option>
          {availablePeriods.months.map(month => (
            <option key={month} value={month}>{month}月</option>
          ))}
        </select>
      </div>

      {displayData.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">💸</div><div className="empty-state-text">該当期間に支出がありません</div></div>
      ) : (
        <>
          <div style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={displayData} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false} 
                  label={(entry) => `${((entry.value / totalExpense) * 100).toFixed(0)}%`} 
                  outerRadius={90} 
                  fill="#8884d8" 
                  dataKey="value"
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]; 
                    const percent = ((data.value / totalExpense) * 100).toFixed(1);
                    return (
                      <div style={{ background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: '10px', boxShadow: 'var(--shadow-strong)' }}>
                        <p style={{ margin: '0 0 8px', fontWeight: '700', fontSize: '14px' }}>{data.name}</p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: data.payload.fill }}>¥{data.value.toLocaleString()}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{percent}%</p>
                      </div>
                    );
                  } 
                  return null;
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 合計表示 */}
          <div style={{ 
            padding: '16px', 
            background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 59, 48, 0.05) 100%)', 
            borderRadius: '12px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {viewMode === 'location' ? '場所別' : 'タグ別'}合計支出
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--expense)' }}>
              ¥{totalExpense.toLocaleString()}
            </div>
          </div>

          {/* 項目リスト */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayData.map((item, index) => {
              const percent = ((item.value / totalExpense) * 100).toFixed(1);
              return (
                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--divider)', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: item.color || COLORS[index % COLORS.length], flexShrink: 0 }} />
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)', flex: 1 }}>{item.name}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '28px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{percent}%</div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: item.color || COLORS[index % COLORS.length] }}>¥{item.value.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
