import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const StatsSummary = ({ transactions }) => {
  // 収入と支出の合計を計算
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    };
  }, [transactions]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
      {/* 収入カード */}
      <div className="card" style={{ padding: '12px', margin: 0, borderLeft: '4px solid var(--income)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
          <TrendingUp size={14} color="var(--income)" />
          <span>総収入</span>
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>
          ¥{totalIncome.toLocaleString()}
        </div>
      </div>

      {/* 支出カード */}
      <div className="card" style={{ padding: '12px', margin: 0, borderLeft: '4px solid var(--expense)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
          <TrendingDown size={14} color="var(--expense)" />
          <span>総支出</span>
        </div>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>
          ¥{totalExpense.toLocaleString()}
        </div>
      </div>

      {/* 残高カード */}
      <div className="card" style={{ padding: '12px', margin: 0, borderLeft: '4px solid var(--primary)', gridColumn: 'span 2' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
          <Activity size={14} color="var(--primary)" />
          <span>収支バランス</span>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
          {balance >= 0 ? '+' : ''}¥{balance.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

// これ重要！ export default がないと undefined になります
export default StatsSummary;