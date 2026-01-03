import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, X, Edit2, Trash2 } from 'lucide-react';

export default function TemplateManager({ onClose }) {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    location: '',
    content: '',
    amount: '',
    tagIds: []
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
      const updated = templates.map(t => 
        t.id === editingTemplate.id ? { ...formData, id: t.id } : t
      );
      saveTemplates(updated);
      setEditingTemplate(null);
    } else {
      const newTemplate = { ...formData, id: Date.now() };
      saveTemplates([...templates, newTemplate]);
    }

    setFormData({ name: '', type: 'expense', location: '', content: '', amount: '', tagIds: [] });
    setIsAdding(false);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({ ...template, tagIds: template.tagIds || [] });
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
    setFormData({ name: '', type: 'expense', location: '', content: '', amount: '', tagIds: [] });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn 0.2s ease' }} onClick={onClose}>
      <div style={{ background: 'var(--bg-elevated)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: '428px', maxHeight: '90vh', overflow: 'auto', animation: 'slideUp 0.3s ease', boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--divider)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bookmark size={24} color="var(--primary)" />テンプレート管理
            </h2>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {isAdding && (
            <div style={{ padding: '20px', background: 'var(--bg-color)', borderRadius: '16px', marginBottom: '20px', border: '2px dashed var(--divider)' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>テンプレート名</label>
                <input type="text" className="input-field" placeholder="例: スーパーでの買い物" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>種別</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setFormData({...formData, type: 'income'})} style={{ flex: 1, padding: '12px', background: formData.type === 'income' ? 'linear-gradient(135deg, var(--income) 0%, #2ECC71 100%)' : 'var(--bg-elevated)', color: formData.type === 'income' ? 'white' : 'var(--text-main)', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' }}>収入</button>
                  <button onClick={() => setFormData({...formData, type: 'expense'})} style={{ flex: 1, padding: '12px', background: formData.type === 'expense' ? 'linear-gradient(135deg, var(--expense) 0%, #E74C3C 100%)' : 'var(--bg-elevated)', color: formData.type === 'expense' ? 'white' : 'var(--text-main)', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' }}>支出</button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>場所</label>
                <input type="text" className="input-field" placeholder="例: スーパー" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>内容</label>
                <input type="text" className="input-field" placeholder="例: 食材" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>金額（任意）</label>
                <input type="number" inputMode="numeric" className="input-field" placeholder="デフォルト金額" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>タグ（最大5個）</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(() => {
                    const savedTags = JSON.parse(localStorage.getItem('tagMaster') || '[]');
                    return savedTags.map(tag => {
                      const isSelected = formData.tagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormData({...formData, tagIds: formData.tagIds.filter(id => id !== tag.id)});
                            } else if (formData.tagIds.length < 5) {
                              setFormData({...formData, tagIds: [...formData.tagIds, tag.id]});
                            }
                          }}
                          style={{
                            padding: '8px 14px',
                            borderRadius: '20px',
                            border: isSelected ? 'none' : '1px solid var(--divider)',
                            background: isSelected ? tag.color : 'transparent',
                            color: isSelected ? 'white' : 'var(--text-main)',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {tag.name}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleCancel} style={{ flex: 1, padding: '14px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--divider)', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>キャンセル</button>
                <button onClick={handleSaveTemplate} disabled={!formData.name || !formData.location} style={{ flex: 1, padding: '14px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: !formData.name || !formData.location ? 'not-allowed' : 'pointer', opacity: !formData.name || !formData.location ? 0.5 : 1 }}>
                  {editingTemplate ? '更新' : '追加'}
                </button>
              </div>
            </div>
          )}

          {!isAdding && (
            <button onClick={() => setIsAdding(true)} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              <Plus size={20} />テンプレートを追加
            </button>
          )}

          {templates.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">テンプレートがありません</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {templates.map(template => (
                <div key={template.id} style={{ padding: '16px', background: template.type === 'income' ? 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)' : 'linear-gradient(135deg, rgba(255, 59, 48, 0.1) 0%, rgba(255, 59, 48, 0.05) 100%)', borderRadius: '12px', border: `2px solid ${template.type === 'income' ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-main)' }}>{template.name}</span>
                        <span style={{ padding: '4px 10px', background: template.type === 'income' ? 'var(--income)' : 'var(--expense)', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                          {template.type === 'income' ? '収入' : '支出'}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {template.location} · {template.content}
                        {template.amount && ` · ¥${parseFloat(template.amount).toLocaleString()}`}
                      </div>
                      {template.tagIds && template.tagIds.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                          {template.tagIds.map(tagId => {
                            const savedTags = JSON.parse(localStorage.getItem('tagMaster') || '[]');
                            const tag = savedTags.find(t => t.id === tagId);
                            return tag ? (
                              <span key={tagId} style={{ padding: '4px 8px', borderRadius: '6px', background: tag.color, color: 'white', fontSize: '11px', fontWeight: '600' }}>
                                {tag.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleEdit(template)} style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', color: 'var(--primary)' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(template.id)} style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', color: 'var(--expense)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
