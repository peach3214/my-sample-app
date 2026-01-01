import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ transactions }) {
  const data = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = `${d.getMonth() + 1}月`;
    return { name: label, income: 0, expense: 0 };
  });

  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,日付,場所,金額\n" 
      + transactions.map(t => `${t.date},${t.location},${t.amount}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
      <h3>収支推移</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="income" fill="#1890ff" />
            <Bar dataKey="expense" fill="#ff4d4f" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <button onClick={downloadCSV} style={{ marginTop: '10px' }}>CSV書き出し</button>
    </div>
  );
}