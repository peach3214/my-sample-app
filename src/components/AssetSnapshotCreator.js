import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Camera, Check } from 'lucide-react';

export default function AssetSnapshotCreator() {
  const [accounts, setAccounts] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [balances, setBalances] = useState({});
  const [stockPrices, setStockPrices] = useState({});
  const [exchangeRate, setExchangeRate] = useState('');
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMasterData();
    
    const handleAutoSnapshot = () => {
      handleCreateSnapshot();
    };
    window.addEventListener('autoSnapshotTriggered', handleAutoSnapshot);
    return () => {
      window.removeEventListener('autoSnapshotTriggered', handleAutoSnapshot);
    };
  }, []);

  const fetchMasterData = async () => {
    const { data: accountData } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (accountData) {
      setAccounts(accountData);
      const initialBalances = {};
      accountData.forEach(acc => {
        initialBalances[acc.id] = acc.current_balance || '';
      });
      setBalances(initialBalances);
    }

    const { data: holdingData } = await supabase
      .from('stock_holdings')
      .select('*')
      .eq('is_active', true);

    if (holdingData) {
      setHoldings(holdingData);
      const initialPrices = {};
      holdingData.forEach(h => {
        initialPrices[h.id] = h.current_price || '';
      });
      setStockPrices(initialPrices);
    }
  };

  const handleCreateSnapshot = async () => {
    const hasEmptyBalance = accounts.some(acc => !balances[acc.id]);
    const hasEmptyPrice = holdings.some(h => !stockPrices[h.id]);
    const hasUSD = holdings.some(h => h.currency === 'USD');

    if (hasEmptyBalance || hasEmptyPrice) {
      alert('すべての残高と株価を入力してください');
      return;
    }

    if (hasUSD && !exchangeRate) {
      alert('USD銘柄があるため、為替レートを入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const snapshots = [];
      const rate = parseFloat(exchangeRate) || 1;

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

      holdings.forEach(h => {
        const unitPrice = parseFloat(stockPrices[h.id]);
        const currency = h.currency || 'JPY';
        let amountInJPY;

        if (currency === 'USD') {
          amountInJPY = unitPrice * h.quantity * rate;
        } else {
          amountInJPY = unitPrice * h.quantity;
        }
        
        snapshots.push({
          snapshot_date: snapshotDate,
          asset_type: 'stock',
          asset_id: h.id,
          asset_name: `${h.name} (${h.ticker_symbol})`,
          amount: amountInJPY,
          quantity: h.quantity,
          unit_price: unitPrice,
          currency: currency
        });
      });

      await supabase.from('asset_snapshots').delete().eq('snapshot_date', snapshotDate);
      const { error } = await supabase.from('asset_snapshots').insert(snapshots);

      if (error) {
        alert('スナップショットの作成に失敗しました');
      } else {
        alert('スナップショットを作成しました！');
      }
    } catch (error) {
      alert('エラーが発生しました');
    }

    setIsLoading(false);
  };

  const totalBankBalance = accounts.reduce((sum, acc) => sum + (parseFloat(balances[acc.id]) || 0), 0);
  const totalStockValue = holdings.reduce((sum, h) => {
    const price = parseFloat(stockPrices[h.id]) || 0;
    const currency = h.currency || 'JPY';
    const rate = parseFloat(exchangeRate) || 1;
    return sum + (currency === 'USD' ? price * h.quantity * rate : price * h.quantity);
  }, 0);

  const grandTotal = totalBankBalance + totalStockValue;
  const hasUSD = holdings.some(h => h.currency === 'USD');

  return (
    <div className="card">
      <div className="card-title">
        <Camera size={20} color="var(--primary)" />
        資産スナップショット作成
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>スナップショット日付</label>
        <input type="date" className="input-field" value={snapshotDate} onChange={(e) => setSnapshotDate(e.target.value)} />
      </div>

      {hasUSD && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>為替レート（USD/JPY）</label>
          <input type="number" inputMode="decimal" className="input-field" placeholder="例: 150.50" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} />
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>1 USD = {exchangeRate || '0'} JPY</div>
        </div>
      )}

      {accounts.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px' }}>銀行残高</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--divider)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>{acc.bank_name} - {acc.name}</div>
                <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--primary)' }}>¥{(parseFloat(balances[acc.id]) || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>預金合計</span>
            <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--primary)' }}>¥{totalBankBalance.toLocaleString()}</span>
          </div>
        </div>
      )}

      {holdings.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '12px' }}>株式評価額</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {holdings.map(h => {
              const price = parseFloat(stockPrices[h.id]) || 0;
              const currency = h.currency || 'JPY';
              const rate = parseFloat(exchangeRate) || 1;
              const totalValue = currency === 'USD' ? price * h.quantity * rate : price * h.quantity;

              return (
                <div key={h.id} style={{ padding: '12px', background: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--divider)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>{h.name} ({h.ticker_symbol}) × {h.quantity.toLocaleString()}株</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{currency === 'JPY' ? '¥' : '$'}{price.toLocaleString()}{currency === 'USD' && ` × ${rate}`}</div>
                    <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--income)' }}>¥{totalValue.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>株式合計</span>
            <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--income)' }}>¥{totalStockValue.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div style={{ padding: '16px', background: 'linear-gradient(135deg, var(--primary) 0%, #0051D5 100%)', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0, 122, 255, 0.3)' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>総資産</div>
        <div style={{ fontSize: '32px', fontWeight: '800', color: 'white', letterSpacing: '-1px' }}>¥{grandTotal.toLocaleString()}</div>
      </div>

      <button onClick={handleCreateSnapshot} disabled={isLoading || accounts.length === 0} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: isLoading || accounts.length === 0 ? 'not-allowed' : 'pointer', opacity: isLoading || accounts.length === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Check size={20} />
        {isLoading ? '作成中...' : 'スナップショットを作成'}
      </button>
    </div>
  );
}
