import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function EditTransactionModal({ transaction, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    type: transaction.type,
    location: transaction.location,
    content: transaction.content || '',
    amount: transaction.amount.toString(),
    date: transaction.date,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.amount) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from('transactions')
      .update({
        type: formData.type,
        location: formData.location,
        content: formData.content,
        amount: parseInt(formData.amount),
        date: formData.date,
      })
      .eq('id', transaction.id);

    setIsSubmitting(false);

    if (error) {
      alert('更新エラー: ' + error.message);
    } else {
      onUpdate();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('この取引を削除しますか？')) return;

    setIsDeleting(true);

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction.id);

    setIsDeleting(false);

    if (error) {
      alert('削除エラー: ' + error.message);
    } else {
      onUpdate();
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.2s ease'
    }} onClick={onClose}>
      <div 
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: '20px 20px 0 0',
          width: '100%',
          maxWidth: '428px',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'slideUp 0.3s ease',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--divider)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-elevated)',
          zIndex: 1
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--text-main)'
          }}>取引を編集</h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-color)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleUpdate} style={{ padding: '24px' }}>
          <div className="form-grid">
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

            <div className="input-group">
              <label>場所・お店</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="例: セブンイレブン"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label>メモ（任意）</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="詳細を追加..."
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
              />
            </div>

            <div className="input-group">
              <label>金額</label>
              <input 
                type="number" 
                inputMode="numeric"
                className="input-field"
                placeholder="0"
                style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'right' }}
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>

            {/* ボタングループ */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button 
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: '0 0 auto',
                  background: 'var(--expense)',
                  color: 'white',
                  border: 'none',
                  padding: '18px 24px',
                  borderRadius: '14px',
                  fontSize: '17px',
                  fontWeight: '600',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(255, 59, 48, 0.35)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isDeleting ? 0.5 : 1
                }}
              >
                <Trash2 size={18} />
                {isDeleting ? '削除中...' : '削除'}
              </button>

              <button 
                type="submit" 
                disabled={isSubmitting || !formData.location || !formData.amount}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '18px',
                  borderRadius: '14px',
                  fontSize: '17px',
                  fontWeight: '600',
                  cursor: (isSubmitting || !formData.location || !formData.amount) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 20px rgba(0, 122, 255, 0.35)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: (isSubmitting || !formData.location || !formData.amount) ? 0.5 : 1
                }}
              >
                <Save size={18} />
                {isSubmitting ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}