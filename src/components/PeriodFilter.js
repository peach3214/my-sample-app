import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, X, Tag } from 'lucide-react';

export default function PeriodFilter({ transactions, onFilteredTransactions }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  // 利用可能なタグを抽出
  const availableTags = useMemo(() => {
    const tagMap = new Map();
    transactions.forEach(t => {
      if (t.tags && Array.isArray(t.tags)) {
        t.tags.forEach(tag => {
          if (!tagMap.has(tag.id)) {
            tagMap.set(tag.id, tag);
          }
        });
      }
    });
    return Array.from(tagMap.values());
  }, [transactions]);

  // フィルタリング処理
  useEffect(() => {
    let filtered = [...transactions];

    // 期間フィルター
    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.date <= endDate);
    }

    // タグフィルター
    if (selectedTags.length > 0) {
      filtered = filtered.filter(t => {
        if (!t.tags || t.tags.length === 0) return false;
        return selectedTags.some(selectedTag => 
          t.tags.some(tag => tag.id === selectedTag.id)
        );
      });
    }

    onFilteredTransactions(filtered);
  }, [startDate, endDate, selectedTags, transactions, onFilteredTransactions]);

  const handleToggleTag = (tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedTags([]);
  };

  const isFiltered = startDate || endDate || selectedTags.length > 0;

  // クイック期間設定
  const setQuickPeriod = (period) => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    let start = '';

    switch (period) {
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        start = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        start = monthAgo.toISOString().split('T')[0];
        break;
      case '3months':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        start = threeMonthsAgo.toISOString().split('T')[0];
        break;
      case '6months':
        const sixMonthsAgo = new Date(today);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        start = sixMonthsAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        start = yearAgo.toISOString().split('T')[0];
        break;
      default:
        break;
    }

    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div style={{ 
      background: 'var(--bg-color)', 
      borderRadius: '12px', 
      padding: '16px',
      border: '1px solid var(--divider)',
      marginBottom: '16px'
    }}>
      {/* クイック期間選択 */}
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
          クイック選択
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '8px' 
        }}>
          <button
            type="button"
            onClick={() => setQuickPeriod('week')}
            style={{
              padding: '10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--divider)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
          >
            1週間
          </button>
          <button
            type="button"
            onClick={() => setQuickPeriod('month')}
            style={{
              padding: '10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--divider)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
          >
            1ヶ月
          </button>
          <button
            type="button"
            onClick={() => setQuickPeriod('3months')}
            style={{
              padding: '10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--divider)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
          >
            3ヶ月
          </button>
          <button
            type="button"
            onClick={() => setQuickPeriod('6months')}
            style={{
              padding: '10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--divider)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
          >
            6ヶ月
          </button>
          <button
            type="button"
            onClick={() => setQuickPeriod('year')}
            style={{
              padding: '10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--divider)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
          >
            1年
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            style={{
              padding: '10px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--divider)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            すべて
          </button>
        </div>
      </div>

      {/* カスタム期間 */}
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
          <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
          期間指定
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center' }}>
          <input
            type="date"
            className="input-field"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ fontSize: '14px' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>〜</span>
          <input
            type="date"
            className="input-field"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ fontSize: '14px' }}
          />
        </div>
      </div>

      {/* タグフィルター */}
      {availableTags.length > 0 && (
        <div style={{ marginBottom: isFiltered ? '16px' : '0' }}>
          <label style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <Tag size={14} style={{ display: 'inline', marginRight: '4px' }} />
            タグフィルター
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {availableTags.map(tag => {
              const isSelected = selectedTags.some(t => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: isSelected ? 'none' : '1px solid var(--divider)',
                    background: isSelected ? tag.color : 'transparent',
                    color: isSelected ? 'white' : 'var(--text-main)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {tag.name}
                  {isSelected && <X size={14} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* クリアボタン */}
      {isFiltered && (
        <button
          onClick={handleClearFilters}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            border: '1px solid var(--divider)',
            borderRadius: '10px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          フィルターをクリア
        </button>
      )}
    </div>
  );
}
