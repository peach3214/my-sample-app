import React, { useState, useEffect } from 'react';
import { Tag, Plus, X, Edit2, Trash2, Check } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function TagMaster({ onClose }) {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#007AFF');
  const [editingTag, setEditingTag] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 定義済みカラーパレット
  const colorPalette = [
    '#007AFF', // Blue
    '#34C759', // Green
    '#FF3B30', // Red
    '#FF9500', // Orange
    '#FFCC00', // Yellow
    '#AF52DE', // Purple
    '#FF2D55', // Pink
    '#5856D6', // Indigo
    '#00C7BE', // Teal
    '#8E8E93', // Gray
  ];

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('タグ取得エラー:', error);
    } else {
      setTags(data || []);
    }
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from('tags')
      .insert([{
        name: newTagName.trim(),
        color: newTagColor
      }]);

    setIsSubmitting(false);

    if (error) {
      alert('タグ追加エラー: ' + error.message);
    } else {
      setNewTagName('');
      setNewTagColor('#007AFF');
      fetchTags();
    }
  };

  const handleUpdateTag = async (tag) => {
    setIsSubmitting(true);

    const { error } = await supabase
      .from('tags')
      .update({
        name: tag.name,
        color: tag.color
      })
      .eq('id', tag.id);

    setIsSubmitting(false);

    if (error) {
      alert('タグ更新エラー: ' + error.message);
    } else {
      setEditingTag(null);
      fetchTags();
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('このタグを削除しますか？\n紐づいている取引からも削除されます。')) return;

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      alert('タグ削除エラー: ' + error.message);
    } else {
      fetchTags();
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
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Tag size={24} color="var(--primary)" />
            タグ管理
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
          {/* 新規タグ追加フォーム */}
          <form onSubmit={handleAddTag} style={{ marginBottom: '24px' }}>
            <div style={{
              padding: '20px',
              background: 'var(--bg-color)',
              borderRadius: '12px',
              border: '2px dashed var(--divider)'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  新しいタグ
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="例: 食費、交通費、趣味"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  maxLength={20}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  カラー
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px'
                }}>
                  {colorPalette.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTagColor(color)}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '8px',
                        background: color,
                        border: newTagColor === color ? '3px solid var(--text-main)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newTagName.trim()}
                style={{
                  width: '100%',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isSubmitting || !newTagName.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: isSubmitting || !newTagName.trim() ? 0.5 : 1
                }}
              >
                <Plus size={18} />
                {isSubmitting ? '追加中...' : 'タグを追加'}
              </button>
            </div>
          </form>

          {/* タグリスト */}
          <div>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              登録済みタグ ({tags.length}/50)
            </h3>

            {tags.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏷️</div>
                <div className="empty-state-text">タグがありません</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'var(--bg-color)',
                      borderRadius: '10px',
                      border: '1px solid var(--divider)'
                    }}
                  >
                    {editingTag?.id === tag.id ? (
                      <>
                        <input
                          type="color"
                          value={editingTag.color}
                          onChange={(e) => setEditingTag({...editingTag, color: e.target.value})}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                        <input
                          type="text"
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                          className="input-field"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '14px' }}
                          maxLength={20}
                        />
                        <button
                          onClick={() => handleUpdateTag(editingTag)}
                          style={{
                            background: 'var(--income)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'white'
                          }}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingTag(null)}
                          style={{
                            background: 'var(--text-tertiary)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'white'
                          }}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: tag.color,
                          flexShrink: 0
                        }} />
                        <div style={{ flex: 1, fontWeight: '600', fontSize: '15px' }}>
                          {tag.name}
                        </div>
                        <button
                          onClick={() => setEditingTag(tag)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'var(--primary)'
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer',
                            color: 'var(--expense)'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 説明 */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'var(--bg-color)',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              💡 <strong>ヒント：</strong> タグは取引の分類に使えます。1つの取引に最大5つまでタグを付けられます。タグごとの集計は分析タブで確認できます。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
