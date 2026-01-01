import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function Dashboard({ transactions }) {
  // 直近6ヶ月のデータを作成
  const data = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getMonth() + 1}月`;
    return { key, name: label, income: 0, expense: 0 };
  });

  transactions.forEach(t => {
    const key = t.date.slice(0, 7);
    const target = data.find(d => d.key === key);
    if (target) {
      if (t.type === 'income') target.income += t.amount;
      else target.expense += t.amount;
    }
  });

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-elevated)',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-strong)',
          border: 'none'
        }}>
          <p style={{ 
            margin: '0 0 12px', 
            fontWeight: '700', 
            fontSize: '15px',
            color: 'var(--text-main)'
          }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: index === 0 ? '8px' : '0'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: entry.color 
              }} />
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: 'var(--text-secondary)'
              }}>
                {entry.name === 'income' ? '収入' : '支出'}:
              </span>
              <span style={{ 
                fontSize: '15px', 
                fontWeight: '700',
                color: entry.color
              }}>
                ¥{entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-title">
        <TrendingUp size={20} color="var(--primary)"/>
        収支レポート
      </div>
      
      {/* サマリー統計 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px', 
        marginBottom: '24px' 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(52, 199, 89, 0.05) 100%)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(52, 199, 89, 0.2)'
        }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            総収入
          </div>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: '800', 
            color: 'var(--income)',
            letterSpacing: '-0.5px'
          }}>
            ¥{data.reduce((sum, d) => sum + d.income, 0).toLocaleString()}
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.15) 0%, rgba(255, 59, 48, 0.05) 100%)',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 59, 48, 0.2)'
        }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            総支出
          </div>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: '800', 
            color: 'var(--expense)',
            letterSpacing: '-0.5px'
          }}>
            ¥{data.reduce((sum, d) => sum + d.expense, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* チャート */}
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--divider)" 
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              tick={{fontSize: 13, fontWeight: 500, fill: 'var(--text-secondary)'}} 
              axisLine={false} 
              tickLine={false}
            />
            <YAxis 
              tick={{fontSize: 12, fontWeight: 500, fill: 'var(--text-secondary)'}} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-color)', opacity: 0.3 }} />
            <Bar 
              dataKey="income" 
              fill="var(--income)" 
              radius={[8, 8, 0, 0]} 
              barSize={24}
            />
            <Bar 
              dataKey="expense" 
              fill="var(--expense)" 
              radius={[8, 8, 0, 0]} 
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}