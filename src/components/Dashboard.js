import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function Dashboard({ transactions }) {
  // 直近6ヶ月のデータを作成
  const data = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getMonth() + 1}月`;
    return { key, name: label, income: 0, expense: 0, balance: 0 };
  });

  transactions.forEach(t => {
    const key = t.date.slice(0, 7);
    const target = data.find(d => d.key === key);
    if (target) {
      if (t.type === 'income') target.income += t.amount;
      else target.expense += t.amount;
    }
  });

  // 残金を計算
  data.forEach(d => {
    d.balance = d.income - d.expense;
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
              marginBottom: index === payload.length - 1 ? '0' : '8px'
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
                {entry.name === 'income' ? '収入' : entry.name === 'expense' ? '支出' : '残金'}:
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
    <>
      {/* 収支表 */}
      <div className="card">
        <div className="card-title">
          <DollarSign size={20} color="var(--primary)"/>
          収支一覧
        </div>
        
        {/* テーブル */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ 
                borderBottom: '2px solid var(--divider)',
                background: 'var(--bg-color)'
              }}>
                <th style={{ 
                  padding: '12px 8px', 
                  textAlign: 'left',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>月</th>
                <th style={{ 
                  padding: '12px 8px', 
                  textAlign: 'right',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>収入</th>
                <th style={{ 
                  padding: '12px 8px', 
                  textAlign: 'right',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>支出</th>
                <th style={{ 
                  padding: '12px 8px', 
                  textAlign: 'right',
                  fontWeight: '700',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>残金</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, idx) => (
                <tr key={d.key} style={{
                  borderBottom: idx === data.length - 1 ? 'none' : '1px solid var(--divider)',
                  transition: 'background 0.2s ease'
                }}>
                  <td style={{ 
                    padding: '14px 8px',
                    fontWeight: '600',
                    color: 'var(--text-main)'
                  }}>{d.name}</td>
                  <td style={{ 
                    padding: '14px 8px', 
                    textAlign: 'right',
                    fontWeight: '700',
                    color: 'var(--income)'
                  }}>¥{d.income.toLocaleString()}</td>
                  <td style={{ 
                    padding: '14px 8px', 
                    textAlign: 'right',
                    fontWeight: '700',
                    color: 'var(--expense)'
                  }}>¥{d.expense.toLocaleString()}</td>
                  <td style={{ 
                    padding: '14px 8px', 
                    textAlign: 'right',
                    fontWeight: '800',
                    fontSize: '15px',
                    color: d.balance >= 0 ? 'var(--income)' : 'var(--expense)'
                  }}>{d.balance >= 0 ? '' : '-'}¥{Math.abs(d.balance).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 合計行 */}
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, var(--bg-color) 0%, var(--bg-elevated) 100%)',
          borderRadius: '12px',
          border: '2px solid var(--divider)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>総収入</div>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--income)',
                letterSpacing: '-0.5px'
              }}>¥{data.reduce((sum, d) => sum + d.income, 0).toLocaleString()}</div>
            </div>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>総支出</div>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                color: 'var(--expense)',
                letterSpacing: '-0.5px'
              }}>¥{data.reduce((sum, d) => sum + d.expense, 0).toLocaleString()}</div>
            </div>
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>総残金</div>
              <div style={{
                fontSize: '18px',
                fontWeight: '800',
                color: data.reduce((sum, d) => sum + d.balance, 0) >= 0 ? 'var(--income)' : 'var(--expense)',
                letterSpacing: '-0.5px'
              }}>
                ¥{data.reduce((sum, d) => sum + d.balance, 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* チャート */}
      <div className="card">
        <div className="card-title">
          <TrendingUp size={20} color="var(--primary)"/>
          収支グラフ
        </div>
        
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
                barSize={20}
              />
              <Bar 
                dataKey="expense" 
                fill="var(--expense)" 
                radius={[8, 8, 0, 0]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
