import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Plus } from 'lucide-react';

export default function TransactionForm({ onAdded, existingTransactions }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    category_type: 'variable',
    location: '',
    content: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const counts = {};
    existingTransactions.forEach(t => {
      counts[t.location] = (counts[t.location] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([loc]) => loc)
      .filter(loc => loc.includes(formData.location) && loc !== formData.location)
      .slice(0, 5);
  }, [existingTransactions, formData.location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    // ログイン機能未実装の場合は、SQLで入れたサンプルのuser_idを直接指定するか、
    // RLSを「全員許可」にしてuser_idを適当なUUIDにする必要があります。
    const { error } = await supabase.from('transactions').insert([{
      ...formData,
      amount: parseInt(formData.amount),
      user_id: user?.id || '00000000-0000-0000-0000-000000000000' 
    }]);

    if (error) alert('エラー: ' + error.message);
    else {
      setFormData({ ...formData, location: '', content: '', amount: '' });
      onAdded();
    }
  };

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={20} /> 新規入力</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
          <option value="expense">支出</option>
          <option value="income">収入</option>
        </select>
        <div style={{ position: 'relative' }}>
          <input
            type="text" placeholder="場所" value={formData.location}
            onChange={e => { setFormData({...formData, location: e.target.value}); setShowSuggestions(true); }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ position: 'absolute', background: 'white', border: '1px solid #ccc', width: '100%', zIndex: 10 }}>
              {suggestions.map(s => (
                <div key={s} onClick={() => setFormData({...formData, location: s})} style={{ padding: '5px', cursor: 'pointer' }}>{s}</div>
              ))}
            </div>
          )}
        </div>
        <input type="number" placeholder="金額" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
        <button type="submit" style={{ background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>保存</button>
      </form>
    </div>
  );
}