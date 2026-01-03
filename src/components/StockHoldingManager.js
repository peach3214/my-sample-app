import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { TrendingUp, Plus, Edit2, Trash2 } from 'lucide-react';

export default function StockHoldingManager() {
  const [holdings, setHoldings] = useState([]);
  const [editingHolding, setEditingHolding] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [stockPrices, setStockPrices] = useState({});
  const [formData, setFormData] = useState({
    ticker_symbol: '',
    name: '',
    quantity: '',
    currency: 'JPY'
  });

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    const { data, error } = await supabase
      .from('stock_holdings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHoldings(data);
      const initialPrices = {};
      data.forEach(h => {
        initialPrices[h.id] = h.current_price || 0;
      });
      setStockPrices(initialPrices);
    }
  };

  const handleSave = async () => {
    if (!formData.ticker_symbol || !formData.name || !formData.quantity) return;

    if (editingHolding) {
      const { error } = await supabase
        .from('stock_holdings')
        .update({
          ticker_symbol: formData.ticker_symbol,
          name: formData.name,
          quantity: parseFloat(formData.quantity),
          currency: formData.currency,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingHolding.id);

      if (!error) {
        fetchHoldings();
        handleCancel();
      }
    } else {
      const { error } = await supabase
        .from('stock_holdings')
        .insert([{
          ticker_symbol: formData.ticker_symbol,
          name: formData.name,
          quantity: parseFloat(formData.quantity),
          currency: formData.currency,
          current_price: 0
        }]);

      if (!error) {
        fetchHoldings();
        handleCancel();
      }
    }
  };

  const handleEdit = (holding) => {
    setEditingHolding(holding);
    setFormData({
      ticker_symbol: holding.ticker_symbol,
      name: holding.name,
      quantity: holding.quantity.toString(),
      currency: holding.currency || 'JPY'
    });
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('この銘柄を削除しますか？')) return;

    const { error } = await supabase
      .from('stock_holdings')
      .update({ is_active: false })
      .eq('id', id);

    if (!error) {
      fetchHoldings();
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingHolding(null);
    setFormData({ ticker_symbol: '', name: '', quantity: '', currency: 'JPY' });
  };

  const handlePriceUpdate = async (holdingId, newPrice) => {
    const { error } = await supabase
      .from('stock_holdings')
      .update({
        current_price: parseFloat(newPrice) || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', holdingId);

    if (!error) {
      setStockPrices({...stockPrices, [holdingId]: newPrice});
    }
  };

  const totalValue = holdings.reduce((sum, h) => {
    const price = parseFloat(stockPrices[h.id]) || 0;
    return sum + (price * h.quantity);
  }, 0);

  return (
    <div className="card">
      <div className="card-title">
        <TrendingUp size={20} color="var(--primary)" />
        株式保有
      </div>

      {isAdding && (
        <div style={{
          padding: '16px',
          background: 'var(--bg-color)',
          borderRadius: '12px',
          border: '2px dashed var(--divider)',
          marginBottom: '16px'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              display: 'block'
            }}>銘柄コード</label>
            <input
              type="text"
              className="input-field"
              placeholder="例: 7203、AAPL"
              value={formData.ticker_symbol}
              onChange={(e) => setFormData({...formData, ticker_symbol: e.target.value.toUpperCase()})}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              display: 'block'
            }}>銘柄名</label>
            <input
              type="text"
              className="input-field"
              placeholder="例: トヨタ自動車"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              display: 'block'
            }}>保有数</label>
            <input
              type="number"
              inputMode="decimal"
              className="input-field"
              placeholder="100"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              display: 'block'
            }}>通貨</label>
            <select
              className="input-field"
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
            >
              <option value="JPY">日本円（JPY）</option>
              <option value="USD">米ドル（USD）</option>
            </select>
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
              onClick={handleSave}
              disabled={!formData.ticker_symbol || !formData.name || !formData.quantity}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: !formData.ticker_symbol || !formData.name || !formData.quantity ? 'not-allowed' : 'pointer',
                opacity: !formData.ticker_symbol || !formData.name || !formData.quantity ? 0.5 : 1
              }}
            >
              {editingHolding ? '更新' : '追加'}
            </button>
          </div>
        </div>
      )}

      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          style={{
            width: '100%',
            padding: '14px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          <Plus size={18} />
          銘柄を追加
        </button>
      )}

      {holdings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📈</div>
          <div className="empty-state-text">保有銘柄が登録されていません</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {holdings.map(holding => {
              const currentPrice = parseFloat(stockPrices[holding.id]) || 0;
              const totalValue = currentPrice * holding.quantity;
              const currency = holding.currency || 'JPY';

              return (
                <div
                  key={holding.id}
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(52, 199, 89, 0.3)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <TrendingUp size={20} color="var(--income)" style={{ marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          fontWeight: '700',
                          fontSize: '15px',
                          color: 'var(--text-main)'
                        }}>
                          {holding.name}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          background: 'var(--primary)',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {holding.ticker_symbol}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          background: currency === 'USD' ? '#34C759' : '#007AFF',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {currency}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        marginBottom: '12px'
                      }}>
                        保有数: {holding.quantity.toLocaleString()}株
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: '8px 12px',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: 'var(--text-secondary)' }}>株価:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            inputMode="decimal"
                            className="input-field"
                            placeholder="株価を入力"
                            value={stockPrices[holding.id] || ''}
                            onChange={(e) => setStockPrices({...stockPrices, [holding.id]: e.target.value})}
                            onBlur={(e) => handlePriceUpdate(holding.id, e.target.value)}
                            style={{ 
                              flex: 1, 
                              marginBottom: 0,
                              fontSize: '14px',
                              padding: '6px 8px'
                            }}
                          />
                          <span style={{ fontWeight: '700', color: 'var(--text-main)', minWidth: '100px' }}>
                            {currency === 'JPY' ? '¥' : '$'}{currentPrice.toLocaleString()}
                          </span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)' }}>評価額:</span>
                        <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--income)' }}>
                          {currency === 'JPY' ? '¥' : '$'}{totalValue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleEdit(holding)}
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
                        onClick={() => handleDelete(holding.id)}
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.2) 0%, rgba(52, 199, 89, 0.1) 100%)',
            borderRadius: '12px',
            border: '2px solid rgba(52, 199, 89, 0.4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-main)'
            }}>
              株式評価額合計（円換算前）
            </span>
            <span style={{
              fontSize: '18px',
              fontWeight: '800',
              color: 'var(--income)',
              letterSpacing: '-0.5px'
            }}>
              ¥{totalValue.toLocaleString()}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
