import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // 作成したクライアントをインポート

function App() {
  const [items, setItems] = useState([]);
  const [inputTitle, setInputTitle] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [inputType, setInputType] = useState('expense');
  const [loading, setLoading] = useState(true);

  // 1. ページ読み込み時にSupabaseからデータを取得する
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('データ取得エラー:', error);
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  // 2. データを追加する処理
  const handleAdd = async () => {
    if (inputTitle === '' || inputAmount === '') return;

    const { data, error } = await supabase
      .from('records')
      .insert([
        { 
          title: inputTitle, 
          amount: parseInt(inputAmount), 
          type: inputType 
        }
      ])
      .select(); // 追加したデータを取得する

    if (error) {
      console.error('追加エラー:', error);
      alert('保存に失敗しました。RLS設定を確認してください。');
    } else if (data) {
      setItems([data[0], ...items]); // リストの先頭に追加
      setInputTitle('');
      setInputAmount('');
    }
  };

  // 3. データを削除する処理
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('削除エラー:', error);
    } else {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  // 合計金額の計算
  const totalIncome = items.filter(i => i.type === 'income').reduce((acc, cur) => acc + cur.amount, 0);
  const totalExpense = items.filter(i => i.type === 'expense').reduce((acc, cur) => acc + cur.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>👛 Supabase家計簿</h1>

      {/* 入力エリア */}
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>新規入力</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <select value={inputType} onChange={(e) => setInputType(e.target.value)} style={{ padding: '8px' }}>
            <option value="expense">支出</option>
            <option value="income">収入</option>
          </select>
          <input
            type="text"
            placeholder="項目"
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
          保存する
        </button>
      </div>

      {/* 集計エリア */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <div>収入: <span style={{ color: 'green' }}>+{totalIncome.toLocaleString()}</span></div>
        <div>支出: <span style={{ color: 'red' }}>-{totalExpense.toLocaleString()}</span></div>
        <div style={{ fontWeight: 'bold' }}>残高: {balance.toLocaleString()}</div>
      </div>

      {/* リスト表示エリア */}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.map((item) => (
            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <div>
                <span style={{ marginRight: '10px', color: '#888', fontSize: '0.8rem' }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
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
      )}
    </div>
  );
}

export default App;