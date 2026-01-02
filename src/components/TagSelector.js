import React, { useState, useEffect } from 'react';
import { Tag, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function TagSelector({ selectedTags = [], onChange, maxTags = 5 }) {
  const [availableTags, setAvailableTags] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('タグ取得エラー:', error);
    } else {
      setAvailableTags(data || []);
    }
  };

  const handleToggleTag = (tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    
    if (isSelected) {
      // 選択解除
      onChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      // 選択追加（最大数チェック）
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, tag]);
      }
    }
  };

  const handleRemoveTag = (tagId) => {
    onChange(selectedTags.filter(t => t.id !== tagId));
  };

  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        marginBottom: '8px',
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        タグ（最大{maxTags}個）
      </label>

      {/* 選択済みタグ */}
      {selectedTags.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '8px'
        }}>
          {selectedTags.map(tag => (
            <div
              key={tag.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '20px',
                background: tag.color,
                color: 'white',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  color: 'white'
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* タグ追加ボタン */}
      {selectedTags.length < maxTags && (
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="input-field"
          style={{
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <Tag size={16} />
          タグを追加...
        </button>
      )}

      {/* ドロップダウン */}
      {showDropdown && (
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
            onClick={() => setShowDropdown(false)}
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
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            border: '1px solid var(--divider)'
          }}>
            {availableTags.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '13px'
              }}>
                タグがありません
              </div>
            ) : (
              availableTags
                .filter(tag => !selectedTags.some(t => t.id === tag.id))
                .map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      handleToggleTag(tag);
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--divider)',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: tag.color,
                      flexShrink: 0
                    }} />
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>
                      {tag.name}
                    </span>
                  </button>
                ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
