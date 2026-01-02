import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Bookmark } from 'lucide-react';
import TagSelector from './TagSelector';

export default function TransactionForm({ onAdded, existingTransactions }) {
  const [formData, setFormData] = useState({
    type: 'expense', // 初期値は支出
    location: '',
    content: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    tags: [] // タグを追加
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState([]);

  // テンプレートを読み込む
  React.useEffect(() => {
    const saved = localStorage.getItem('transactionTemplates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  // 履歴からのレコメンド機能
  const suggestions = useMemo(() => {
    if (!formData.location) return [];
    const counts = {};
    existingTransactions.forEach(t => {
      counts[t.location] = (counts[t.location] || 0) + 1;
    });
    return Object.keys(counts)
      .filter(loc => loc.toLowerCase().includes(formData.location.toLowerCase()) && loc !== formData.location)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 5);
  }, [existingTransactions, formData.location]);

  // テンプレートを適用
  const handleApplyTemplate = (template) => {
    setFormData({
      ...formData,
      type: template.type,
      location: template.location,
      content: template.content || '',
      amount: template.amount || ''
    });
    setShowTemplates(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.amount) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.from('transactions').insert([{
        type: formData.type,
        location: formData.location,
        content: formData.content,
        amount: parseInt(formData.amount),
        date: formData.date,
        category_type: 'variable',
        tags: formData.tags // タグを保存
      }]).select();

      setIsSubmitting(false);

      if (error) {
        console.error('保存エラー:', error);
        alert('保存エラー: ' + error.message);
      } else if (data && data.length > 0) {
        // フォームをリセット
        setFormData({ 
          ...formData, 
          location: '', 
          content: '', 
          amount: '',
          tags: [] // タグもリセット
        });
        onAdded();
      }
    } catch (err) {
      console.error('予期しないエラー:', err);
      setIsSubmitting(false);
      alert('保存中にエラーが発生しました');
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <Save size={20} color="var(--primary)" />
        取引を記録
      </div>
      
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

        {/* テンプレート選択ボタン */}
        {templates.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-color)',
                border: '1px solid var(--divider)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-main)',
                transition: 'all 0.2s ease'
              }}
            >
              <Bookmark size={16} />
              テンプレートから選択
            </button>

            {/* テンプレートドロップダウン */}
            {showTemplates && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                  }}
                  onClick={() => setShowTemplates(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-strong)',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  border: '1px solid var(--divider)'
                }}>
                  {templates.map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleApplyTemplate(template)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--divider)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <div style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: template.type === 'income' 
                            ? 'rgba(52, 199, 89, 0.2)' 
                            : 'rgba(255, 59, 48, 0.2)',
                          color: template.type === 'income' ? 'var(--income)' : 'var(--expense)',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {template.type === 'income' ? '収入' : '支出'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', fontSize: '14px' }}>
                            {template.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {template.location}
                            {template.content && ` · ${template.content}`}
                          </div>
                        </div>
                        {template.amount && (
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: template.type === 'income' ? 'var(--income)' : 'var(--expense)'
                          }}>
                            ¥{template.amount}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

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
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {/* レコメンド表示 */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map(s => (
                <div 
                  key={s} 
                  className="suggestion-item" 
                  onClick={() => {
                    setFormData({...formData, location: s});
                    setShowSuggestions(false);
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
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

        {/* タグセレクター */}
        <div className="input-group">
          <TagSelector
            selectedTags={formData.tags}
            onChange={(tags) => setFormData({...formData, tags})}
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting || !formData.location || !formData.amount}
          style={{
            opacity: (isSubmitting || !formData.location || !formData.amount) ? 0.5 : 1,
            cursor: (isSubmitting || !formData.location || !formData.amount) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? '保存中...' : '記録する'}
        </button>
      </form>
    </div>
  );
}
