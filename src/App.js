import React, { useState } from 'react';

// サンプルの初期データ
const initialData = [
  { id: 1, date: '2024-01-01', title: 'お年玉', amount: 10000, type: 'income' },
  { id: 2, date: '2024-01-02', title: 'カフェ', amount: 500, type: 'expense' },
  { id: 3, date: '2024-01-03', title: '書籍代', amount: 1500, type: 'expense' },
];

function App() {
  const [items, setItems] = useState(initialData);
  const [inputTitle, setInputTitle] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [inputType, setInputType] = useState('expense'); // expense(支出) or income(収入)

  // 追加ボタンを押した時の処理
  const handleAdd = () => {
    if (inputTitle === '' || inputAmount === '') return;

    const newItem = {
      id: Date.now(), // 一時的なIDとして現在時刻を使用
      date: new Date().toISOString().split('T')[0], // 今日の日付
      title: inputTitle,
      amount: parseInt(inputAmount),
      type: inputType,
    };

    setItems([newItem, ...items]); // 新しいアイテムをリストの先頭に追加
    setInputTitle('');
    setInputAmount('');
  };

  // 削除ボタンを押した時の処理
  const handleDelete = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // 合計金額の計算
  const totalIncome = items.filter(i => i.type === 'income').reduce((acc, cur) => acc + cur.amount, 0);
  const totalExpense = items.filter(i => i.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>👛 シンプル家計簿</h1>

      {/* 入力エリア */}
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>新規入力</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select 
            value={inputType} 
            onChange={(e) => setInputType(e.target.value)}
            style={{ padding: '8px' }}
          >
            <option value="expense">支出</option>
            <option value="income">収入</option>
          </select>
          <input
            type="text"
            placeholder="項目（例: ランチ）"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
          />
          <input
            type="number"
            placeholder="金額"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            style={{ padding: '8px', width: '100px' }}
          />
        </div>
        <button 
          onClick={handleAdd}
          style={{ width: '100%', padding: '10px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          追加する
        </button>
      </div>

      {/* 集計エリア */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <div>収入: <span style={{ color: 'green' }}>+{totalIncome.toLocaleString()}</span></div>
        <div>支出: <span style={{ color: 'red' }}>-{totalExpense.toLocaleString()}</span></div>
        <div style={{ fontWeight: 'bold' }}>残高: {balance.toLocaleString()}</div>
      </div>

      {/* リスト表示エリア */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0' }}>
            <div>
              <span style={{ marginRight: '10px', color: '#888', fontSize: '0.8rem' }}>{item.date}</span>
              <span>{item.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: item.type === 'income' ? 'green' : 'red', fontWeight: 'bold' }}>
                {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString()}円
              </span>
              <button onClick={() => handleDelete(item.id)} style={{ background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px' }}>削除</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;