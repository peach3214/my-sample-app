import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MoneyFlow({ transactions }) {
  // 集計ロジック
  const calcTotal = (type) => 
    transactions
      .filter(t => t.type === type)
      .reduce((acc, curr) => {
        acc[curr.location] = (acc[curr.location] || 0) + curr.amount;
        return acc;
      }, {});

  const incomeMap = calcTotal('income');
  const expenseMap = calcTotal('expense');

  // 合計値（分母用）
  const totalIn = Object.values(incomeMap).reduce((a, b) => a + b, 0) || 1;
  const totalOut = Object.values(expenseMap).reduce((a, b) => a + b, 0) || 1;

  // 全項目を表示（金額降順）
  const allIncome = Object.entries(incomeMap).sort(([,a], [,b]) => b - a);
  const allExpense = Object.entries(expenseMap).sort(([,a], [,b]) => b - a);

  return (
    <div className="card">
      <div className="card-title">
        <TrendingUp size={20} color="var(--primary)" />
        お金の流れ
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 収入エリア */}
        <div>
          <div style={{
            fontSize:'15px', 
            color:'var(--text-main)', 
            fontWeight: '700',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <TrendingUp size={18} color="var(--income)" />
            収入
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allIncome.map(([loc, amt]) => {
              const percentage = ((amt / totalIn) * 100).toFixed(0);
              return (
                <div key={loc} className="flow-bar" style={{ 
                  background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.15) 0%, rgba(52, 199, 89, 0.08) 100%)',
                  border: '1px solid rgba(52, 199, 89, 0.2)',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                    <span style={{
                      overflow:'hidden', 
                      textOverflow:'ellipsis', 
                      whiteSpace:'nowrap',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>{loc}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {percentage}%
                    </span>
                  </div>
                  <span style={{fontWeight:'700', color: 'var(--income)', fontSize: '15px'}}>
                    ¥{amt.toLocaleString()}
                  </span>
                </div>
              );
            })}
            {allIncome.length === 0 && (
              <div style={{
                fontSize:'13px', 
                color:'var(--text-tertiary)',
                textAlign: 'center',
                padding: '20px 10px',
                fontWeight: '500'
              }}>データなし</div>
            )}
          </div>
        </div>

        {/* 支出エリア */}
        <div>
          <div style={{
            fontSize:'15px', 
            color:'var(--text-main)', 
            fontWeight: '700',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <TrendingDown size={18} color="var(--expense)" />
            支出
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {allExpense.map(([loc, amt]) => {
              const percentage = ((amt / totalOut) * 100).toFixed(0);
              return (
                <div key={loc} className="flow-bar" style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.15) 0%, rgba(255, 59, 48, 0.08) 100%)',
                  border: '1px solid rgba(255, 59, 48, 0.2)',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                    <span style={{
                      overflow:'hidden', 
                      textOverflow:'ellipsis', 
                      whiteSpace:'nowrap',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>{loc}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {percentage}%
                    </span>
                  </div>
                  <span style={{fontWeight:'700', color: 'var(--expense)', fontSize: '15px'}}>
                    ¥{amt.toLocaleString()}
                  </span>
                </div>
              );
            })}
            {allExpense.length === 0 && (
              <div style={{
                fontSize:'13px', 
                color:'var(--text-tertiary)',
                textAlign: 'center',
                padding: '20px 10px',
                fontWeight: '500'
              }}>データなし</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
