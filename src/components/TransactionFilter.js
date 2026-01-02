import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function TransactionFilter({ transactions, onFilteredTransactions }) {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, income, expense
  const [selectedTags, setSelectedTags] = useState([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // 利用可能なタグを抽出
  const availableTags = React.useMemo(() => {
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
  React.useEffect(() => {
    let filtered = [...transactions];

    // テキスト検索
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(t => 
        t.location.toLowerCase().includes(query) ||
        (t.content && t.content.toLowerCase().includes(query))
      );
    }

    // 収入/支出フィルター
    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    // タグフィルター
    if (selectedTags.length > 0) {
      filtered = filtered.filter(t => {
        if (!t.tags || t.tags.length === 0) return false;
        return selectedTags.every(selectedTag => 
          t.tags.some(tag => tag.id === selectedTag.id)
        );
      });
    }

    // 金額フィルター
    if (minAmount) {
      filtered = filtered.filter(t => t.amount >= parseInt(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(t => t.amount <= parseInt(maxAmount));
    }

    onFilteredTransactions(filtered);
  }, [searchText, selectedType, selectedTags, minAmount, maxAmount, transactions, onFilteredTransactions]);

  const handleToggleTag = (tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedType('all');
    setSelectedTags([]);
    setMinAmount('');
    setMaxAmount('');
  };

  const isFiltered = searchText || selectedType !== 'all' || selectedTags.length > 0 || minAmount || maxAmount;

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* 検索バー */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div style={{ 
          flex: 1, 
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search 
            size={18} 
            color="var(--text-secondary)" 
            style={{ 
              position: 'absolute', 
              left: '12px',
              pointerEvents: 'none'
            }} 
          />
          <input
            type="text"
            className="input-field"
            placeholder="場所やメモで検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ 
              paddingLeft: '40px',
              paddingRight: searchText ? '40px' : '12px'
            }}
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          style={{
            padding: '12px 16px',
            background: showFilterPanel || isFiltered ? 'var(--primary)' : 'var(--bg-color)',
            color: showFilterPanel || isFiltered ? 'white' : 'var(--text-main)',
            border: '1px solid var(--divider)',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          <Filter size={18} />
          フィルター
        </button>
      </div>

      {/* フィルターパネル */}
      {showFilterPanel && (
        <div style={{
          background: 'var(--bg-color)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid var(--divider)',
          animation: 'slideDown 0.2s ease'
        }}>
          {/* 収入/支出切り替え */}
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
              種類
            </label>
            <div className="toggle-group" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <button
                type="button"
                className={`toggle-btn ${selectedType === 'all' ? 'active-income' : ''}`}
                onClick={() => setSelectedType('all')}
              >
                すべて
              </button>
              <button
                type="button"
                className={`toggle-btn ${selectedType === 'income' ? 'active-income' : ''}`}
                onClick={() => setSelectedType('income')}
              >
                収入
              </button>
              <button
                type="button"
                className={`toggle-btn ${selectedType === 'expense' ? 'active-expense' : ''}`}
                onClick={() => setSelectedType('expense')}
              >
                支出
              </button>
            </div>
          </div>

          {/* タグフィルター */}
          {availableTags.length > 0 && (
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
                タグ
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
                        padding: '6px 12px',
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
                })}
              </div>
            </div>
          )}

          {/* 金額範囲 */}
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
              金額範囲
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                inputMode="numeric"
                className="input-field"
                placeholder="最小"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                style={{ textAlign: 'center' }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>〜</span>
              <input
                type="number"
                inputMode="numeric"
                className="input-field"
                placeholder="最大"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                style={{ textAlign: 'center' }}
              />
            </div>
          </div>

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
      )}

      {/* フィルター結果サマリー */}
      {isFiltered && (
        <div style={{
          marginTop: '12px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          fontWeight: '600'
        }}>
          {transactions.length}件中 {transactions.filter(t => {
            let filtered = true;
            if (searchText.trim()) {
              const query = searchText.toLowerCase();
              filtered = filtered && (t.location.toLowerCase().includes(query) || (t.content && t.content.toLowerCase().includes(query)));
            }
            if (selectedType !== 'all') filtered = filtered && t.type === selectedType;
            if (selectedTags.length > 0) {
              filtered = filtered && t.tags && selectedTags.every(st => t.tags.some(tag => tag.id === st.id));
            }
            if (minAmount) filtered = filtered && t.amount >= parseInt(minAmount);
            if (maxAmount) filtered = filtered && t.amount <= parseInt(maxAmount);
            return filtered;
          }).length}件を表示
        </div>
      )}
    </div>
  );
}
