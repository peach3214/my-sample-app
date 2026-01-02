import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, X, Edit2, Trash2, Check } from 'lucide-react';

export default function TemplateManager({ onClose }) {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    location: '',
    content: '',
    amount: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const saved = localStorage.getItem('transactionTemplates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  };

  const saveTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem('transactionTemplates', JSON.stringify(newTemplates));
  };

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.location) return;

    if (editingTemplate) {
      // 編集
      const updated = templates.map(t => 
        t.id === editingTemplate.id ? { ...formData, id: t.id } : t
      );
      saveTemplates(updated);
      setEditingTemplate(null);
    } else {
      // 新規追加
      const newTemplate = {
        ...formData,
        id: Date.now()
      };
      saveTemplates([...templates, newTemplate]);
    }

    setFormData({ name: '', type: 'expense', location: '', content: '', amount: '' });
    setIsAdding(false);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData(template);
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('このテンプレートを削除しますか？')) {
      saveTemplates(templates.filter(t => t.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingTemplate(null);
    setFormData({ name: '', type: 'expense', location: '', content: '', amount: '' });
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
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Bookmark size={24} color="var(--primary)" />
            テンプレート管理
          </h2>
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

        {/* コンテンツ */}
        <div style={{ padding: '24px' }}>
          {/* 新規追加・編集フォーム */}
          {isAdding && (
            <div style={{
              padding: '20px',
              background: 'var(--bg-color)',
              borderRadius: '12px',
              border: '2px dashed var(--divider)',
              marginBottom: '24px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  display: 'block'
                }}>テンプレート名</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: コンビニランチ"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  display: 'block'
                }}>種類</label>
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
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  display: 'block'
                }}>場所</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="場所を入力"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  display: 'block'
                }}>メモ（任意）</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="詳細を追加..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  display: 'block'
                }}>デフォルト金額（任意）</label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="input-field"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid var(--divider)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    color: 'var(--text-main)'
                  }}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={!formData.name || !formData.location}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: !formData.name || !formData.location ? 'not-allowed' : 'pointer',
                    opacity: !formData.name || !formData.location ? 0.5 : 1
                  }}
                >
                  {editingTemplate ? '更新' : '保存'}
                </button>
              </div>
            </div>
          )}

          {/* 追加ボタン */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '24px'
              }}
            >
              <Plus size={20} />
              新しいテンプレート
            </button>
          )}

          {/* テンプレートリスト */}
          <div>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              登録済みテンプレート ({templates.length})
            </h3>

            {templates.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">テンプレートがありません</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {templates.map(template => (
                  <div
                    key={template.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: template.type === 'income'
                        ? 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 59, 48, 0.05) 100%)',
                      borderRadius: '12px',
                      border: `1px solid ${template.type === 'income' ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)'}`
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '700',
                        fontSize: '16px',
                        color: 'var(--text-main)',
                        marginBottom: '4px'
                      }}>
                        {template.name}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                      }}>
                        {template.location}
                        {template.content && ` · ${template.content}`}
                      </div>
                      {template.amount && (
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '700',
                          color: template.type === 'income' ? 'var(--income)' : 'var(--expense)'
                        }}>
                          {template.type === 'income' ? '+' : '-'}¥{template.amount}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleEdit(template)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        color: 'var(--primary)'
                      }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        color: 'var(--expense)'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
