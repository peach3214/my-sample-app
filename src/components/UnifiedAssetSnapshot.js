import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Camera, Check, Building2, TrendingUp, Plus, X } from 'lucide-react';

export default function UnifiedAssetSnapshot() {
  const [bankEntries, setBankEntries] = useState([{ id: Date.now(), name: '', amount: '' }]);
  const [stockEntries, setStockEntries] = useState([{ id: Date.now(), name: '', amount: '' }]);
  const [exchangeRate, setExchangeRate] = useState('');
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const addBankEntry = () => {
    setBankEntries([...bankEntries, { id: Date.now(), name: '', amount: '' }]);
  };

  const removeBankEntry = (id) => {
    if (bankEntries.length > 1) {
      setBankEntries(bankEntries.filter(e => e.id !== id));
    }
  };

  const updateBankEntry = (id, field, value) => {
    setBankEntries(bankEntries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const addStockEntry = () => {
    setStockEntries([...stockEntries, { id: Date.now(), name: '', amount: '' }]);
  };

  const removeStockEntry = (id) => {
    if (stockEntries.length > 1) {
      setStockEntries(stockEntries.filter(e => e.id !== id));
    }
  };

  const updateStockEntry = (id, field, value) => {
    setStockEntries(stockEntries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleCreateSnapshot = async () => {
    const validBankEntries = bankEntries.filter(e => e.name && e.amount);
    const validStockEntries = stockEntries.filter(e => e.name && e.amount);

    if (validBankEntries.length === 0 && validStockEntries.length === 0) {
      alert('少なくとも1つの項目を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const snapshots = [];

      validBankEntries.forEach(entry => {
        snapshots.push({
          snapshot_date: snapshotDate,
          asset_type: 'bank',
          asset_id: entry.id,
          asset_name: entry.name,
          amount: parseFloat(entry.amount),
          currency: 'JPY'
        });
      });

      validStockEntries.forEach(entry => {
        snapshots.push({
          snapshot_date: snapshotDate,
          asset_type: 'stock',
          asset_id: entry.id,
          asset_name: entry.name,
          amount: parseFloat(entry.amount),
          currency: 'JPY'
        });
      });

      await supabase.from('asset_snapshots').delete().eq('snapshot_date', snapshotDate);
      const { error } = await supabase.from('asset_snapshots').insert(snapshots);

      if (!error) {
        alert('スナップショットを作成しました！');
        // 入力をクリア
        setBankEntries([{ id: Date.now(), name: '', amount: '' }]);
        setStockEntries([{ id: Date.now(), name: '', amount: '' }]);
      } else {
        alert('スナップショットの作成に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    }

    setIsLoading(false);
  };

  const totalBank = bankEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalStock = stockEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const grandTotal = totalBank + totalStock;

  return (
    <div className="card">
      <div className="card-title"><Camera size={20} color="var(--primary)" />資産スナップショット</div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>日付</label>
        <input type="date" className="input-field" value={snapshotDate} onChange={(e) => setSnapshotDate(e.target.value)} />
      </div>

      {/* 銀行残高入力 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="var(--primary)" />銀行残高
          </h3>
          <button onClick={addBankEntry} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={14} />追加
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {bankEntries.map((entry, index) => (
            <div key={entry.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="text" className="input-field" placeholder="名称（例: 三菱UFJ）" value={entry.name} onChange={(e) => updateBankEntry(entry.id, 'name', e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
              <input type="number" inputMode="numeric" className="input-field" placeholder="金額" value={entry.amount} onChange={(e) => updateBankEntry(entry.id, 'amount', e.target.value)} style={{ width: '120px', marginBottom: 0 }} />
              {bankEntries.length > 1 && (
                <button onClick={() => removeBankEntry(entry.id)} style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', color: 'var(--expense)' }}>
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>預金合計</span>
          <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--primary)' }}>¥{totalBank.toLocaleString()}</span>
        </div>
      </div>

      {/* 株式評価入力 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="var(--income)" />株式評価
          </h3>
          <button onClick={addStockEntry} style={{ background: 'var(--income)', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={14} />追加
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stockEntries.map((entry, index) => (
            <div key={entry.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="text" className="input-field" placeholder="名称（例: トヨタ）" value={entry.name} onChange={(e) => updateStockEntry(entry.id, 'name', e.target.value)} style={{ flex: 1, marginBottom: 0 }} />
              <input type="number" inputMode="numeric" className="input-field" placeholder="評価額" value={entry.amount} onChange={(e) => updateStockEntry(entry.id, 'amount', e.target.value)} style={{ width: '120px', marginBottom: 0 }} />
              {stockEntries.length > 1 && (
                <button onClick={() => removeStockEntry(entry.id)} style={{ background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer', color: 'var(--expense)' }}>
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(52, 199, 89, 0.05) 100%)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>株式合計</span>
          <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--income)' }}>¥{totalStock.toLocaleString()}</span>
        </div>
      </div>

      {/* 総資産 */}
      <div style={{ padding: '16px', background: 'linear-gradient(135deg, var(--primary) 0%, #0051D5 100%)', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0, 122, 255, 0.3)' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>総資産</div>
        <div style={{ fontSize: '32px', fontWeight: '800', color: 'white', letterSpacing: '-1px' }}>¥{grandTotal.toLocaleString()}</div>
      </div>

      <button onClick={handleCreateSnapshot} disabled={isLoading} style={{ width: '100%', padding: '16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Check size={20} />
        {isLoading ? '作成中...' : 'スナップショットを作成'}
      </button>
    </div>
  );
}
