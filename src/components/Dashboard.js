import React, { useMemo, useState } from 'react';
import { BarChart2, ChevronDown, ChevronRight } from 'lucide-react';

export default function Dashboard({ transactions }) {
  const [expandedYears, setExpandedYears] = useState({});

  const yearlyData = useMemo(() => {
    const grouped = {};
    
    transactions.forEach(t => {
      const year = t.date.slice(0, 4);
      const month = t.date.slice(5, 7);
      
      if (!grouped[year]) {
        grouped[year] = { months: {}, total: { income: 0, expense: 0, balance: 0 } };
      }
      
      if (!grouped[year].months[month]) {
        grouped[year].months[month] = { month, income: 0, expense: 0, balance: 0 };
      }
      
      if (t.type === 'income') {
        grouped[year].months[month].income += t.amount;
        grouped[year].total.income += t.amount;
      } else {
        grouped[year].months[month].expense += t.amount;
        grouped[year].total.expense += t.amount;
      }
      
      grouped[year].months[month].balance = grouped[year].months[month].income - grouped[year].months[month].expense;
    });

    Object.keys(grouped).forEach(year => {
      grouped[year].total.balance = grouped[year].total.income - grouped[year].total.expense;
    });

    const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    const result = {};
    
    sortedYears.forEach(year => {
      const sortedMonths = Object.values(grouped[year].months).sort((a, b) => a.month.localeCompare(b.month));
      result[year] = { months: sortedMonths, total: grouped[year].total };
    });

    return result;
  }, [transactions]);

  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const grandTotal = useMemo(() => {
    const allIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const allExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { income: allIncome, expense: allExpense, balance: allIncome - allExpense };
  }, [transactions]);

  return (
    <div className="card">
      <div className="card-title"><BarChart2 size={20} color="var(--primary)" />収支一覧</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--divider)', background: 'var(--bg-color)' }}>
              <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '700', fontSize: '12px', color: 'var(--text-secondary)' }}>年月</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', fontSize: '12px', color: 'var(--text-secondary)' }}>収入</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', fontSize: '12px', color: 'var(--text-secondary)' }}>支出</th>
              <th style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', fontSize: '12px', color: 'var(--text-secondary)' }}>残金</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(yearlyData).map(year => (
              <React.Fragment key={year}>
                <tr onClick={() => toggleYear(year)} style={{ background: 'var(--bg-color)', cursor: 'pointer', borderTop: '2px solid var(--divider)', borderBottom: expandedYears[year] ? '1px solid var(--divider)' : '2px solid var(--divider)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {expandedYears[year] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {year}年
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '700', color: 'var(--income)' }}>¥{yearlyData[year].total.income.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '700', color: 'var(--expense)' }}>¥{yearlyData[year].total.expense.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '800', fontSize: '13px', color: yearlyData[year].total.balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>
                    ¥{Math.abs(yearlyData[year].total.balance).toLocaleString()}
                  </td>
                </tr>
                {expandedYears[year] && yearlyData[year].months.map((m, idx) => (
                  <tr key={`${year}-${m.month}`} style={{ borderBottom: idx === yearlyData[year].months.length - 1 ? 'none' : '1px solid var(--divider)' }}>
                    <td style={{ padding: '10px 8px 10px 32px', fontWeight: '600', fontSize: '12px', color: 'var(--text-secondary)' }}>{m.month}月</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', fontSize: '12px', color: m.income > 0 ? 'var(--income)' : 'var(--text-tertiary)' }}>{m.income > 0 ? `¥${m.income.toLocaleString()}` : '-'}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '600', fontSize: '12px', color: m.expense > 0 ? 'var(--expense)' : 'var(--text-tertiary)' }}>{m.expense > 0 ? `¥${m.expense.toLocaleString()}` : '-'}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', fontSize: '12px', color: m.balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>¥{Math.abs(m.balance).toLocaleString()}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px', padding: '16px', background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)', borderRadius: '12px', border: '1px solid rgba(0, 122, 255, 0.2)' }}>
        <div><div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>総収入</div><div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--income)' }}>¥{grandTotal.income.toLocaleString()}</div></div>
        <div><div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>総支出</div><div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--expense)' }}>¥{grandTotal.expense.toLocaleString()}</div></div>
        <div><div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>総残金</div><div style={{ fontSize: '16px', fontWeight: '800', color: grandTotal.balance >= 0 ? 'var(--income)' : 'var(--expense)' }}>¥{Math.abs(grandTotal.balance).toLocaleString()}</div></div>
      </div>
    </div>
  );
}
