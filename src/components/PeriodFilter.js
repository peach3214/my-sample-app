import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, X, Tag } from 'lucide-react';

export default function PeriodFilter({ transactions, onFilteredTransactions, showSearchText = true }) {
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  // 利用可能な年月と場所を抽出
  const { availableYears, availableMonths, availableLocations } = useMemo(() => {
    const years = new Set();
    const months = new Set();
    const locations = new Set();
    transactions.forEach(t => {
      years.add(t.date.slice(0, 4));
      months.add(t.date.slice(5, 7));
      locations.add(t.location);
    });
    return {
      availableYears: Array.from(years).sort((a, b) => b.localeCompare(a)),
      availableMonths: Array.from(months).sort(),
      availableLocations: Array.from(locations).sort()
    };
  }, [transactions]);

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

    // 年月フィルター
    if (selectedYear) {
      filtered = filtered.filter(t => t.date.startsWith(selectedYear));
    }
    if (selectedMonth) {
      filtered = filtered.filter(t => t.date.slice(5, 7) === selectedMonth);
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

    // 場所フィルター
    if (selectedLocation) {
      filtered = filtered.filter(t => t.location === selectedLocation);
    }

    onFilteredTransactions(filtered);
  }, [selectedYear, selectedMonth, selectedTags, selectedLocation, transactions, onFilteredTransactions]);

  const handleToggleTag = (tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleClearFilters = () => {
    setSelectedYear('');
    setSelectedMonth('');
    setSelectedTags([]);
    setSelectedLocation('');
  };

  const isFiltered = selectedYear || selectedMonth || selectedTags.length > 0 || selectedLocation;

  // クイック期間設定
  const setQuickPeriod = (period) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    switch (period) {
      case 'thisMonth':
        setSelectedYear(String(year));
        setSelectedMonth(month);
        break;
      case 'lastMonth':
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        setSelectedYear(String(lastMonth.getFullYear()));
        setSelectedMonth(String(lastMonth.getMonth() + 1).padStart(2, '0'));
        break;
      case 'thisYear':
        setSelectedYear(String(year));
        setSelectedMonth('');
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ 
      background: 'var(--bg-color)', 
      borderRadius: '12px', 
      padding: '16px',
      border: '1px solid var(--divider)',
      marginBottom: '16px'
    }}>
      {/* クイック選択 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
          クイック選択
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <button type="button" onClick={() => setQuickPeriod('thisMonth')} style={{ padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--divider)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: 'var(--text-main)' }}>今月</button>
          <button type="button" onClick={() => setQuickPeriod('lastMonth')} style={{ padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--divider)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: 'var(--text-main)' }}>先月</button>
          <button type="button" onClick={() => setQuickPeriod('thisYear')} style={{ padding: '10px', background: 'var(--bg-elevated)', border: '1px solid var(--divider)', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: 'var(--text-main)' }}>今年</button>
        </div>
      </div>

      {/* 年月選択 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>年</label>
          <select className="input-field" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="">全年</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>月</label>
          <select className="input-field" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="">全月</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}月</option>
            ))}
          </select>
        </div>
      </div>

      {/* 場所選択 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>場所</label>
        <select className="input-field" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} style={{ marginBottom: 0 }}>
          <option value="">全場所</option>
          {availableLocations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {/* タグフィルター */}
      {availableTags.length > 0 && (
        <div style={{ marginBottom: isFiltered ? '16px' : '0' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
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
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <X size={16} />
          フィルターをクリア
        </button>
      )}
    </div>
  );
}
