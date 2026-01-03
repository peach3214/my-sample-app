import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, Plus, X } from 'lucide-react';

export default function ExpenseBreakdown({ transactions }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [showItemSelector, setShowItemSelector] = useState(false);

  const allExpenseData = useMemo(() => {
    const expenseMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      expenseMap[t.location] = (expenseMap[t.location] || 0) + t.amount;
    });
    return Object.entries(expenseMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const displayData = useMemo(() => {
    const top10 = allExpenseData.slice(0, 10);
    const top10Names = new Set(top10.map(item => item.name));
    const additionalItems = selectedItems.map(name => allExpenseData.find(item => item.name === name)).filter(item => item && !top10Names.has(item.name));
    return [...top10, ...additionalItems];
  }, [allExpenseData, selectedItems]);

  const selectableItems = useMemo(() => {
    const top10Names = new Set(displayData.slice(0, 10).map(item => item.name));
    return allExpenseData.filter(item => !top10Names.has(item.name));
  }, [allExpenseData, displayData]);

  const totalExpense = displayData.reduce((sum, item) => sum + item.value, 0);

  const handleToggleItem = (itemName) => {
    if (selectedItems.includes(itemName)) {
      setSelectedItems(selectedItems.filter(name => name !== itemName));
    } else if (selectedItems.length < 5) {
      setSelectedItems([...selectedItems, itemName]);
    }
  };

  const COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#5856D6', '#FF2D55', '#AF52DE', '#5AC8FA', '#FFCC00', '#FF6482', '#00C7BE', '#30D158', '#BF5AF2', '#FFD60A'];

  return (
    <div className="card">
      <div className="card-title"><TrendingDown size={20} color="var(--expense)" />支出の内訳</div>
      {displayData.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">💸</div><div className="empty-state-text">まだ支出がありません</div></div>
      ) : (
        <>
          <div style={{ height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={displayData} cx="50%" cy="50%" labelLine={false} label={(entry) => `${((entry.value / totalExpense) * 100).toFixed(0)}%`} outerRadius={90} fill="#8884d8" dataKey="value">
                {displayData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie><Tooltip content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0]; const percent = ((data.value / totalExpense) * 100).toFixed(1);
                  return (<div style={{ background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: '10px', boxShadow: 'var(--shadow-strong)' }}>
                    <p style={{ margin: '0 0 8px', fontWeight: '700', fontSize: '14px' }}>{data.name}</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: data.payload.fill }}>¥{data.value.toLocaleString()}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{percent}%</p>
                  </div>);
                } return null;
              }} /></PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {displayData.map((item, index) => {
              const percent = ((item.value / totalExpense) * 100).toFixed(1);
              const isSelected = selectedItems.includes(item.name);
              return (
                <div key={item.name} style={{ display: 'flex', flexDirection: 'column', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: isSelected ? '2px solid var(--primary)' : '1px solid var(--divider)', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: COLORS[index % COLORS.length], flexShrink: 0 }} />
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)', flex: 1 }}>{item.name}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '28px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{percent}%</div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: COLORS[index % COLORS.length] }}>¥{item.value.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {selectableItems.length > 0 && (
            <div>
              {!showItemSelector ? (
                <button onClick={() => setShowItemSelector(true)} disabled={selectedItems.length >= 5} style={{ width: '100%', padding: '12px', background: selectedItems.length >= 5 ? 'var(--bg-elevated)' : 'var(--primary)', color: selectedItems.length >= 5 ? 'var(--text-tertiary)' : 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: selectedItems.length >= 5 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Plus size={16} />項目を追加 ({selectedItems.length}/5)
                </button>
              ) : (
                <div style={{ padding: '16px', background: 'var(--bg-color)', borderRadius: '12px', border: '2px dashed var(--divider)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>項目を選択 ({selectedItems.length}/5)</span>
                    <button onClick={() => setShowItemSelector(false)} style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {selectableItems.map(item => {
                      const isSelected = selectedItems.includes(item.name);
                      return (
                        <button key={item.name} onClick={() => handleToggleItem(item.name)} disabled={!isSelected && selectedItems.length >= 5} style={{ padding: '10px 12px', background: isSelected ? 'var(--primary)' : 'white', color: isSelected ? 'white' : 'var(--text-main)', border: isSelected ? 'none' : '1px solid var(--divider)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: (!isSelected && selectedItems.length >= 5) ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: (!isSelected && selectedItems.length >= 5) ? 0.5 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{item.name}</span><span>¥{item.value.toLocaleString()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
