import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Camera, RefreshCw, Check } from 'lucide-react';

export default function AssetSnapshotCreator() {
  const [accounts, setAccounts] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [balances, setBalances] = useState({});
  const [stockPrices, setStockPrices] = useState({});
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPrices, setIsFetchingPrices] = useState(false);

  useEffect(() => {
    fetchMasterData();

    // 自動スナップショットイベントを監視
    const handleAutoSnapshot = () => {
      handleCreateSnapshot();
    };

    window.addEventListener('autoSnapshotTriggered', handleAutoSnapshot);

    return () => {
      window.removeEventListener('autoSnapshotTriggered', handleAutoSnapshot);
    };
  }, []);

  const fetchMasterData = async () => {
    // 銀行口座取得
    const { data: accountData } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (accountData) {
      setAccounts(accountData);
      // DBの残高を初期値として設定
      const initialBalances = {};
      accountData.forEach(acc => {
        initialBalances[acc.id] = acc.current_balance || '';
      });
      setBalances(initialBalances);
    }

    // 株式保有取得
    const { data: holdingData } = await supabase
      .from('stock_holdings')
      .select('*')
      .eq('is_active', true);

    if (holdingData) {
      setHoldings(holdingData);
      // DBの株価を初期値として設定
      const initialPrices = {};
      holdingData.forEach(h => {
        initialPrices[h.id] = h.current_price || '';
      });
      setStockPrices(initialPrices);
    }
  };

  // 株価取得（Yahoo Finance API使用）
  const fetchStockPrices = async () => {
    if (holdings.length === 0) return;

    setIsFetchingPrices(true);
    const prices = {};

    try {
      for (const holding of holdings) {
        // Yahoo Finance APIから株価取得
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${holding.ticker_symbol}?interval=1d&range=1d`
        );
        const data = await response.json();

        if (data.chart && data.chart.result && data.chart.result[0]) {
          const result = data.chart.result[0];
          const quote = result.indicators.quote[0];
          const closePrice = quote.close[quote.close.length - 1];
          
          if (closePrice) {
            prices[holding.id] = closePrice;
          }
        }

        // API制限対策で少し待機
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setStockPrices(prices);
      setIsFetchingPrices(false);
    } catch (error) {
      console.error('株価取得エラー:', error);
      alert('株価の取得に失敗しました。手動で入力してください。');
      setIsFetchingPrices(false);
    }
  };

  const handleCreateSnapshot = async () => {
    // バリデーション
    const hasEmptyBalance = accounts.some(acc => !balances[acc.id]);
    const hasEmptyPrice = holdings.some(h => !stockPrices[h.id]);

    if (hasEmptyBalance || hasEmptyPrice) {
      alert('すべての残高と株価を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const snapshots = [];

      // 銀行口座のスナップショット
      accounts.forEach(acc => {
        snapshots.push({
          snapshot_date: snapshotDate,
          asset_type: 'bank',
          asset_id: acc.id,
          asset_name: `${acc.bank_name} - ${acc.name}`,
          amount: parseFloat(balances[acc.id]),
          currency: 'JPY'
        });
      });

      // 株式のスナップショット
      holdings.forEach(h => {
        const unitPrice = parseFloat(stockPrices[h.id]);
        const totalAmount = unitPrice * h.quantity;
        
        snapshots.push({
          snapshot_date: snapshotDate,
          asset_type: 'stock',
          asset_id: h.id,
          asset_name: `${h.name} (${h.ticker_symbol})`,
          amount: totalAmount,
          quantity: h.quantity,
          unit_price: unitPrice,
          currency: 'JPY'
        });
      });

      // 既存のスナップショットを削除（同じ日付）
      await supabase
        .from('asset_snapshots')
        .delete()
        .eq('snapshot_date', snapshotDate);

      // 新しいスナップショットを挿入
      const { error } = await supabase
        .from('asset_snapshots')
        .insert(snapshots);

      if (error) {
        console.error('スナップショット作成エラー:', error);
        alert('スナップショットの作成に失敗しました');
      } else {
        alert('スナップショットを作成しました！');
        // フォームをリセット
        const initialBalances = {};
        accounts.forEach(acc => {
          initialBalances[acc.id] = '';
        });
        setBalances(initialBalances);
        setStockPrices({});
      }
    } catch (error) {
      console.error('予期しないエラー:', error);
      alert('エラーが発生しました');
    }

    setIsLoading(false);
  };

  const totalBankBalance = accounts.reduce((sum, acc) => {
    const balance = parseFloat(balances[acc.id]) || 0;
    return sum + balance;
  }, 0);

  const totalStockValue = holdings.reduce((sum, h) => {
    const price = parseFloat(stockPrices[h.id]) || 0;
    return sum + (price * h.quantity);
  }, 0);

  const grandTotal = totalBankBalance + totalStockValue;

  return (
    <div className="card">
      <div className="card-title">
        <Camera size={20} color="var(--primary)" />
        資産スナップショット作成
      </div>

      {/* 日付選択 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          marginBottom: '8px',
          display: 'block'
        }}>スナップショット日付</label>
        <input
          type="date"
          className="input-field"
          value={snapshotDate}
          onChange={(e) => setSnapshotDate(e.target.value)}
        />
      </div>

      {/* 銀行残高入力 */}
      {accounts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-main)',
            marginBottom: '12px'
          }}>
            銀行残高
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{
                padding: '12px',
                background: 'var(--bg-color)',
                borderRadius: '10px',
                border: '1px solid var(--divider)'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}>
                  {acc.bank_name} - {acc.name}
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  className="input-field"
                  placeholder="残高を入力"
                  value={balances[acc.id] || ''}
                  onChange={(e) => setBalances({...balances, [acc.id]: e.target.value})}
                  style={{ marginBottom: 0 }}
                />
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
              預金合計
            </span>
            <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--primary)' }}>
              ¥{totalBankBalance.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 株価入力 */}
      {holdings.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text-main)',
              margin: 0
            }}>
              株価（終値）
            </h3>
            <button
              onClick={fetchStockPrices}
              disabled={isFetchingPrices}
              style={{
                padding: '8px 12px',
                background: 'var(--income)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: isFetchingPrices ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isFetchingPrices ? 0.5 : 1
              }}
            >
              <RefreshCw size={14} className={isFetchingPrices ? 'spinning' : ''} />
              自動取得
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {holdings.map(h => {
              const price = parseFloat(stockPrices[h.id]) || 0;
              const totalValue = price * h.quantity;
              
              return (
                <div key={h.id} style={{
                  padding: '12px',
                  background: 'var(--bg-color)',
                  borderRadius: '10px',
                  border: '1px solid var(--divider)'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '6px'
                  }}>
                    {h.name} ({h.ticker_symbol}) × {h.quantity.toLocaleString()}株
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="input-field"
                    placeholder="終値を入力"
                    value={stockPrices[h.id] || ''}
                    onChange={(e) => setStockPrices({...stockPrices, [h.id]: e.target.value})}
                    style={{ marginBottom: '6px' }}
                  />
                  {price > 0 && (
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: 'var(--income)',
                      textAlign: 'right'
                    }}>
                      評価額: ¥{totalValue.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
              株式合計
            </span>
            <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--income)' }}>
              ¥{totalStockValue.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 総資産 */}
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, var(--primary) 0%, #0051D5 100%)',
        borderRadius: '12px',
        marginBottom: '16px',
        boxShadow: '0 4px 20px rgba(0, 122, 255, 0.3)'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          総資産
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: '800',
          color: 'white',
          letterSpacing: '-1px'
        }}>
          ¥{grandTotal.toLocaleString()}
        </div>
      </div>

      {/* 作成ボタン */}
      <button
        onClick={handleCreateSnapshot}
        disabled={isLoading || accounts.length === 0}
        style={{
          width: '100%',
          padding: '16px',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: isLoading || accounts.length === 0 ? 'not-allowed' : 'pointer',
          opacity: isLoading || accounts.length === 0 ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {isLoading ? (
          <>
            <RefreshCw size={20} className="spinning" />
            作成中...
          </>
        ) : (
          <>
            <Check size={20} />
            スナップショットを作成
          </>
        )}
      </button>
    </div>
  );
}
