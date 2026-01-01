import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';

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

  return (
    <div className="card">
      <div className="card-title"><BarChart2 size={20} color="#576574"/> 収支レポート</div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => `¥${value.toLocaleString()}`}
            />
            <Bar dataKey="income" fill="#2ecc71" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="expense" fill="#ff6b6b" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}