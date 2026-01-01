import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { PlusCircle } from 'lucide-react';

export default function TransactionForm({ onAdded, existingTransactions }) {
  const [formData, setFormData] = useState({
    type: 'expense', // 初期値は支出
    location: '',
    content: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 履歴からのレコメンド機能
  const suggestions = useMemo(() => {
    if (!formData.location) return [];
    const counts = {};
    existingTransactions.forEach(t => {
      counts[t.location] = (counts[t.location] || 0) + 1;
    });
    return Object.keys(counts)
      .filter(loc => loc.includes(formData.location) && loc !== formData.location)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 5);
  }, [existingTransactions, formData.location]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.location || !formData.amount) return;

  // 修正：user_id を含めない、または null を送るようにする
  const { error } = await supabase.from('transactions').insert([{
    type: formData.type,
    location: formData.location,
    content: formData.content,
    amount: parseInt(formData.amount),
    date: formData.date,
    category_type: 'variable' // デフォルト値
    // user_id は書かなくてOK（DB側で自動的にnullまたはデフォルトになります）
  }]);

  if (error) {
    alert('保存エラー: ' + error.message);
  } else {
    setFormData({ ...formData, location: '', content: '', amount: '' });
    onAdded();
  }
};

  return (
    <div className="card">
      <div className="card-title"><PlusCircle size={20} color="#ff9f43"/> 入力する</div>
      
      <form onSubmit={handleSubmit} className="form-grid">
        {/* 入出金切り替えタブ */}
        <div className="toggle-group">
          <button
            type="button"
            className={`toggle-btn ${formData.type === 'expense' ? 'active-expense' : ''}`}
            onClick={() => setFormData({...formData, type: 'expense'})}
          >
            支出
          </button>
          <button
            type="button"
            className={`toggle-btn ${formData.type === 'income' ? 'active-income' : ''}`}
            onClick={() => setFormData({...formData, type: 'income'})}
          >
            収入
          </button>
        </div>

        <div className="input-group">
          <label>日付</label>
          <input 
            type="date" 
            className="input-field"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
        </div>

        <div className="input-group" style={{ position: 'relative' }}>
          <label>場所・お店</label>
          <input 
            type="text" 
            className="input-field"
            placeholder="例: セブンイレブン"
            value={formData.location}
            onChange={e => {
              setFormData({...formData, location: e.target.value});
              setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {/* レコメンド表示 */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map(s => (
                <div key={s} className="suggestion-item" onClick={() => setFormData({...formData, location: s})}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-group">
          <label>金額 (円)</label>
          <input 
            type="number" 
            className="input-field"
            placeholder="0"
            style={{ fontSize: '20px', fontWeight: 'bold' }}
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
          />
        </div>

        <button type="submit" className="submit-btn">記録する</button>
      </form>
    </div>
  );
}