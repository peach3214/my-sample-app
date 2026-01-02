import React, { useState, useEffect } from 'react';
import { Zap, Plus, X, Edit2 } from 'lucide-react';

export default function QuickEntry({ onQuickAdd }) {
  const [quickEntries, setQuickEntries] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: '',
    type: 'expense',
    location: '',
    amount: ''
  });

  useEffect(() => {
    // LocalStorageから読み込み
    const saved = localStorage.getItem('quickEntries');
    if (saved) {
      setQuickEntries(JSON.parse(saved));
    }
  }, []);

  const saveQuickEntries = (entries) => {
    setQuickEntries(entries);
    localStorage.setItem('quickEntries', JSON.stringify(entries));
  };

  const handleAddQuickEntry = () => {
    if (!newEntry.name || !newEntry.location || !newEntry.amount) return;

    const entry = {
      id: Date.now(),
      ...newEntry,
      amount: parseInt(newEntry.amount)
    };

    saveQuickEntries([...quickEntries, entry]);
    setNewEntry({ name: '', type: 'expense', location: '', amount: '' });
    setIsAdding(false);
  };

  const handleDeleteQuickEntry = (id) => {
    saveQuickEntries(quickEntries.filter(e => e.id !== id));
  };

  const handleQuickAdd = (entry) => {
    onQuickAdd({
      type: entry.type,
      location: entry.location,
      amount: entry.amount,
      date: new Date().toISOString().split('T')[0]
    });
  };

  if (quickEntries.length === 0 && !isAdding) {
    return (
      <div className="card">
        <div className="card-title">
          <Zap size={20} color="var(--primary)" />
          クイック入力
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <div className="empty-state-text">
            よく使う取引を登録すると<br />ワンタップで記録できます
          </div>
          <button
            onClick={() => setIsAdding(true)}
            style={{
              marginTop: '16px',
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '16px auto 0'
            }}
          >
            <Plus size={18} />
            クイック入力を追加
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="var(--primary)" />
          クイック入力
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <Plus size={16} />
            追加
          </button>
        )}
      </div>

      {/* 新規追加フォーム */}
      {isAdding && (
        <div style={{
          padding: '16px',
          background: 'var(--bg-color)',
          borderRadius: '12px',
          marginBottom: '16px',
          border: '2px dashed var(--divider)'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="名前（例: コンビニランチ）"
              value={newEntry.name}
              onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
              style={{ marginBottom: '8px' }}
            />
            <div className="toggle-group" style={{ marginBottom: '8px' }}>
              <button
                type="button"
                className={`toggle-btn ${newEntry.type === 'expense' ? 'active-expense' : ''}`}
                onClick={() => setNewEntry({...newEntry, type: 'expense'})}
              >
                支出
              </button>
              <button
                type="button"
                className={`toggle-btn ${newEntry.type === 'income' ? 'active-income' : ''}`}
                onClick={() => setNewEntry({...newEntry, type: 'income'})}
              >
                収入
              </button>
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="場所"
              value={newEntry.location}
              onChange={(e) => setNewEntry({...newEntry, location: e.target.value})}
              style={{ marginBottom: '8px' }}
            />
            <input
              type="number"
              inputMode="numeric"
              className="input-field"
              placeholder="金額"
              value={newEntry.amount}
              onChange={(e) => setNewEntry({...newEntry, amount: e.target.value})}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewEntry({ name: '', type: 'expense', location: '', amount: '' });
              }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: '1px solid var(--divider)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
            >
              キャンセル
            </button>
            <button
              onClick={handleAddQuickEntry}
              disabled={!newEntry.name || !newEntry.location || !newEntry.amount}
              style={{
                flex: 1,
                padding: '10px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: !newEntry.name || !newEntry.location || !newEntry.amount ? 'not-allowed' : 'pointer',
                opacity: !newEntry.name || !newEntry.location || !newEntry.amount ? 0.5 : 1
              }}
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* クイック入力ボタン一覧 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {quickEntries.map(entry => (
          <div
            key={entry.id}
            style={{
              position: 'relative',
              padding: '16px',
              background: entry.type === 'income' 
                ? 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 59, 48, 0.05) 100%)',
              border: `2px solid ${entry.type === 'income' ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleQuickAdd(entry)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteQuickEntry(entry.id);
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
            >
              <X size={14} />
            </button>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--text-main)',
              marginBottom: '6px',
              paddingRight: '24px'
            }}>
              {entry.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '8px'
            }}>
              {entry.location}
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '800',
              color: entry.type === 'income' ? 'var(--income)' : 'var(--expense)'
            }}>
              {entry.type === 'income' ? '+' : '-'}¥{entry.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
