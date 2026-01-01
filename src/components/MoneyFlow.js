import React from 'react';
import { ArrowRightLeft } from 'lucide-react';

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

  // 上位3件のみ表示してスマホで見やすく
  const topIn = Object.entries(incomeMap).sort(([,a], [,b]) => b - a).slice(0, 3);
  const topOut = Object.entries(expenseMap).sort(([,a], [,b]) => b - a).slice(0, 5);

  return (
    <div className="card">
      <div className="card-title"><ArrowRightLeft size={20} color="#00d2d3"/> 今月のお金の流れ</div>
      
      <div className="flow-container">
        {/* 収入エリア */}
        <div className="flow-col">
          <div style={{fontSize:'12px', color:'#888', textAlign:'center'}}>IN</div>
          {topIn.map(([loc, amt]) => (
            <div key={loc} className="flow-bar" style={{ background: '#e0f9e8', width: '100%' }}>
              <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60px'}}>{loc}</span>
              <span style={{fontWeight:'bold'}}>¥{amt.toLocaleString()}</span>
            </div>
          ))}
          {topIn.length === 0 && <div style={{fontSize:'10px', color:'#ccc'}}>データなし</div>}
        </div>

        {/* 中央矢印 */}
        <div style={{ color: '#ccc' }}>▶</div>

        {/* 支出エリア */}
        <div className="flow-col">
          <div style={{fontSize:'12px', color:'#888', textAlign:'center'}}>OUT</div>
          {topOut.map(([loc, amt]) => (
            <div key={loc} className="flow-bar" style={{ background: '#ffe5e5', width: '100%' }}>
              <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60px'}}>{loc}</span>
              <span style={{fontWeight:'bold'}}>¥{amt.toLocaleString()}</span>
            </div>
          ))}
          {topOut.length === 0 && <div style={{fontSize:'10px', color:'#ccc'}}>データなし</div>}
        </div>
      </div>
    </div>
  );
}