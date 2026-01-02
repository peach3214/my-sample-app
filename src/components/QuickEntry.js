import React, { useState, useEffect } from 'react';
import { Zap, Plus, X, Save } from 'lucide-react';
import { supabase } from '../supabaseClient';

const QuickEntry = ({ onQuickAdd }) => {
  const [quickEntries, setQuickEntries] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', amount: '', type: 'expense' });

  // クイック設定を取得
  useEffect(() => {
    fetchQuickEntries();
  }, []);

  const fetchQuickEntries = async () => {
    const { data, error } = await supabase
      .from('quick_settings')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching quick entries:', error);
    } else {
      setQuickEntries(data || []);
    }
  };

  const handleSaveQuickSetting = async () => {
    if (!newEntry.name || !newEntry.amount) return;

    const { error } = await supabase
      .from('quick_settings')
      .insert([{
        name: newEntry.name,
        amount: Number(newEntry.amount),
        type: newEntry.type
      }]);

    if (error) {
      alert('保存に失敗しました');
    } else {
      setNewEntry({ name: '', amount: '', type: 'expense' });
      setIsAdding(false);
      fetchQuickEntries();
    }
  };

  const handleDeleteQuickSetting = async (id, e) => {
    e.stopPropagation(); // 親のクリックイベント（追加実行）を阻止
    const { error } = await supabase
      .from('quick_settings')
      .delete()
      .eq('id', id);

    if (error) {
      alert('削除に失敗しました');
    } else {
      fetchQuickEntries();
    }
  };

  // --- レンダリング部分 ---

  // まだ設定が1つもない場合の表示
  if (quickEntries.length === 0 && !isAdding) {
    return (
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-title">
          <Zap size={20} color="var(--primary)" />
          <span>クイック入力</span>
        </div>
        <button 
          className="btn-secondary" 
          style={{ width: '100%', padding: '12px' }}
          onClick={() => setIsAdding(true)}
        >
          <Plus size={18} /> よく使う項目を登録する
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="var(--primary)" />
          <span>クイック入力</span>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
            <Plus size={20} />
          </button>
        )}
      </div>

      {/* 設定済みのボタン一覧 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: isAdding ? '16px' : '0' }}>
        {quickEntries.map((entry) => (
          <div key={entry.id} style={{ position: 'relative' }}>
            <button
              onClick={() => onQuickAdd({
                amount: entry.amount,
                type: entry.type,
                location: entry.name,
                date: new Date().toISOString().split('T')[0]
              })}
              className="quick-add-btn"
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid var(--divider)',
                background: 'var(--bg-elevated)',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{entry.name}</span>
              <span style={{ fontWeight: 'bold', color: entry.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                ¥{entry.amount.toLocaleString()}
              </span>
            </button>
            <button
              onClick={(e) => handleDeleteQuickSetting(entry.id, e)}
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>

      {/* 新規登録フォーム */}
      {isAdding && (
        <div style={{ 
          marginTop: '12px', 
          padding: '12px', 
          background: 'var(--bg-color)', 
          borderRadius: '8px',
          border: '1px dashed var(--divider)' 
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="項目名 (例: ランチ)"
              value={newEntry.name}
              onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
              style={{ flex: 2, padding: '8px', borderRadius: '4px', border: '1px solid var(--divider)' }}
            />
            <input
              type="number"
              placeholder="金額"
              value={newEntry.amount}
              onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--divider)' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <select
              value={newEntry.type}
              onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
              style={{ padding: '4px 8px', borderRadius: '4px' }}
            >
              <option value="expense">支出</option>
              <option value="income">収入</option>
            </select>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsAdding(false)} className="btn-secondary" style={{ padding: '4px 12px' }}>キャンセル</button>
              <button onClick={handleSaveQuickSetting} className="btn-primary" style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Save size={14} /> 保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickEntry;