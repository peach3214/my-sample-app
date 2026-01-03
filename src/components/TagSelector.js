import React, { useState, useEffect } from 'react';
import { Tag, X, Plus } from 'lucide-react';
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

  // タグの追加・削除を切り替えるメインの関数
  const handleToggleTag = (tag) => {
    // onChange が関数でない場合は処理を中断（エラー防止）
    if (typeof onChange !== 'function') {
      console.error('TagSelector: onChange prop is not a function', onChange);
      return;
    }

    const isSelected = selectedTags.some(t => t.id === tag.id);
    
    if (isSelected) {
      // すでに選択されている場合は削除
      onChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      // 選択されていない場合は追加（最大数チェック）
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, tag]);
      } else {
        alert(`タグは最大${maxTags}個までです`);
      }
    }
  };

  // 選択済みタグの「X」ボタン用
  const handleRemoveTag = (e, tagId) => {
    e.stopPropagation(); // 親のクリックイベント（ドロップダウン開閉など）を阻止
    if (typeof onChange === 'function') {
      onChange(selectedTags.filter(t => t.id !== tagId));
    }
  };

  return (
    <div style={{ position: 'relative', marginBottom: '16px' }}>
      <label style={{
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        marginBottom: '8px',
        display: 'block'
      }}>
        タグ（最大{maxTags}個）
      </label>

      <div 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          minHeight: '44px',
          padding: '6px 12px',
          background: 'var(--bg-color)',
          border: '1px solid var(--divider)',
          borderRadius: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        {selectedTags.length === 0 && (
          <span style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>タグを選択...</span>
        )}
        
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '16px',
              background: tag.color || 'var(--primary)',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            {tag.name}
            <X 
              size={14} 
              onClick={(e) => handleRemoveTag(e, tag.id)} 
              style={{ cursor: 'pointer' }}
            />
          </span>
        ))}
        
        <div style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }}>
          <Plus size={18} />
        </div>
      </div>

      {/* ドロップダウンリスト */}
      {showDropdown && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
            onClick={() => setShowDropdown(false)} 
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--divider)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 999,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {availableTags.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                タグがありません。設定から作成してください。
              </div>
            ) : (
              availableTags.map(tag => {
                const isSelected = selectedTags.some(t => t.id === tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: isSelected ? 'var(--bg-color)' : 'transparent',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--divider)',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: tag.color,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: isSelected ? '700' : '600',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)'
                    }}>
                      {tag.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}