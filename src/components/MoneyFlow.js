import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function MoneyFlow({ transactions }) {
  const incomeSources = transactions.filter(t => t.type === 'income').reduce((acc, curr) => {
    acc[curr.location] = (acc[curr.location] || 0) + curr.amount;
    return acc;
  }, {});

  const expenseDestinations = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => {
    acc[curr.location] = (acc[curr.location] || 0) + curr.amount;
    return acc;
  }, {});

  const totalIncome = Object.values(incomeSources).reduce((a, b) => a + b, 0) || 1;
  const totalExpense = Object.values(expenseDestinations).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
      <h2>💸 資金フロー可視化</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {Object.entries(incomeSources).map(([loc, amt]) => (
            <div key={loc} style={{ background: '#e6f7ff', margin: '5px 0', padding: '5px', width: `${(amt/totalIncome)*100}%`, minWidth: '100px' }}>
              {loc}: {amt.toLocaleString()}
            </div>
          ))}
        </div>
        <ArrowRight size={30} color="#ccc" />
        <div style={{ textAlign: 'right' }}>
          {Object.entries(expenseDestinations).map(([loc, amt]) => (
            <div key={loc} style={{ background: '#fff1f0', margin: '5px 0', padding: '5px', width: `${(amt/totalExpense)*100}%`, minWidth: '100px', marginLeft: 'auto' }}>
              {loc}: {amt.toLocaleString()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}