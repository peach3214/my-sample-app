import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingDown } from 'lucide-react';

export default function ExpenseBreakdown({ transactions }) {
  // 場所ごとの支出を集計
  const categoryData = useMemo(() => {
    const expenseMap = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expenseMap[t.location] = (expenseMap[t.location] || 0) + t.amount;
      });

    // 上位5件＋その他
    const sorted = Object.entries(expenseMap)
      .sort(([, a], [, b]) => b - a);
    
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5).reduce((sum, [, amount]) => sum + amount, 0);
    
    const data = top5.map(([name, value]) => ({ name, value }));
    if (others > 0) {
      data.push({ name: 'その他', value: others });
    }
    
    return data;
  }, [transactions]);

  const totalExpense = categoryData.reduce((sum, item) => sum + item.value, 0);

  // カラーパレット
  const COLORS = [
    '#FF3B30', // 赤
    '#FF9500', // オレンジ
    '#FFCC00', // 黄色
    '#34C759', // 緑
    '#007AFF', // 青
    '#8E8E93'  // グレー（その他）
  ];

  // カスタムラベル
  const renderLabel = (entry) => {
    const percent = ((entry.value / totalExpense) * 100).toFixed(0);
    return `${percent}%`;
  };

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          background: 'var(--bg-elevated)',
          padding: '12px 16px',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-strong)',
          border: 'none'
        }}>
          <p style={{ 
            margin: '0 0 8px', 
            fontWeight: '700', 
            fontSize: '14px',
            color: 'var(--text-main)'
          }}>
            {data.name}
          </p>
          <p style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '800',
            color: data.payload.fill
          }}>
            ¥{data.value.toLocaleString()}
          </p>
          <p style={{
            margin: '4px 0 0',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            {((data.value / totalExpense) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (categoryData.length === 0) {
    return (
      <div className="card">
        <div className="card-title">
          <TrendingDown size={20} color="var(--expense)"/>
          支出の内訳
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-text">支出データがありません</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">
        <TrendingDown size={20} color="var(--expense)"/>
        支出の内訳
      </div>
      
      {/* 円グラフ */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 凡例リスト */}
      <div style={{ marginTop: '16px' }}>
        {categoryData.map((item, index) => {
          const percent = ((item.value / totalExpense) * 100).toFixed(1);
          return (
            <div key={item.name} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: index === categoryData.length - 1 ? 'none' : '1px solid var(--divider)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  background: COLORS[index % COLORS.length],
                  flexShrink: 0
                }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {item.name}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)'
                }}>
                  {percent}%
                </span>
                <span style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'var(--expense)',
                  minWidth: '80px',
                  textAlign: 'right'
                }}>
                  ¥{item.value.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
