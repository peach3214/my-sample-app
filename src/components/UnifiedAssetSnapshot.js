import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Camera, Check, Building2, TrendingUp, Plus, X, Calendar, RefreshCw } from 'lucide-react';

export default function UnifiedAssetSnapshot() {
  const [bankEntries, setBankEntries] = useState([{ id: Date.now(), name: '', amount: '' }]);
  const [stockEntries, setStockEntries] = useState([{ id: Date.now(), name: '', amount: '' }]);
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  // 初回読み込み：最新のスナップショットのみを取得
  useEffect(() => {
    fetchLatestSnapshot();
  }, []);

  const fetchLatestSnapshot = async () => {
    setIsLoading(true);
    try {
      // 1. まず、テーブルにある最新の日付を1件だけ取得
      const { data: latestRecord, error: dateError } = await supabase
        .from('asset_snapshots')
        .select('snapshot_date')
        .order('snapshot_date', { ascending: false })
        .limit(1);

      if (dateError) throw dateError;

      if (latestRecord && latestRecord.length > 0) {
        const targetDate = latestRecord[0].snapshot_date;
        setSnapshotDate(targetDate);

        // 2. その最新の日付に紐付く全資産データを取得
        const { data: snapshotData, error: dataError } = await supabase
          .from('asset_snapshots')
          .select('*')
          .eq('snapshot_date', targetDate);

        if (dataError) throw dataError;

        if (snapshotData && snapshotData.length > 0) {
          const banks = snapshotData
            .filter(d => d.asset_type === 'bank')
            .map(d => ({ id: d.id, name: d.asset_name, amount: d.amount }));
          
          const stocks = snapshotData
            .filter(d => d.asset_type === 'stock')
            .map(d => ({ id: d.id, name: d.asset_name, amount: d.amount }));

          setBankEntries(banks.length > 0 ? banks : [{ id: Date.now(), name: '', amount: '' }]);
          setStockEntries(stocks.length > 0 ? stocks : [{ id: Date.now(), name: '', amount: '' }]);
        }
      }
    } catch (err) {
      console.error('読み込み失敗:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addBankEntry = () => setBankEntries([...bankEntries, { id: Date.now(), name: '', amount: '' }]);
  const removeBankEntry = (id) => bankEntries.length > 1 && setBankEntries(bankEntries.filter(e => e.id !== id));
  const updateBankEntry = (id, field, value) => setBankEntries(bankEntries.map(e => e.id === id ? { ...e, [field]: value } : e));

  const addStockEntry = () => setStockEntries([...stockEntries, { id: Date.now(), name: '', amount: '' }]);
  const removeStockEntry = (id) => stockEntries.length > 1 && setStockEntries(stockEntries.filter(e => e.id !== id));
  const updateStockEntry = (id, field, value) => setStockEntries(stockEntries.map(e => e.id === id ? { ...e, [field]: value } : e));

  const totalBank = bankEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalStock = stockEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const grandTotal = totalBank + totalStock;

  const handleCreateSnapshot = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 指定された日付のデータを一旦すべて削除（最新版として上書きするため）
      await supabase.from('asset_snapshots').delete().eq('snapshot_date', snapshotDate);

      const insertData = [];
      bankEntries.forEach(bank => {
        if (bank.name.trim() && bank.amount) {
          insertData.push({ snapshot_date: snapshotDate, asset_type: 'bank', asset_name: bank.name, amount: parseFloat(bank.amount), currency: 'JPY' });
        }
      });
      stockEntries.forEach(stock => {
        if (stock.name.trim() && stock.amount) {
          insertData.push({ snapshot_date: snapshotDate, asset_type: 'stock', asset_name: stock.name, amount: parseFloat(stock.amount), currency: 'JPY' });
        }
      });

      if (insertData.length === 0) throw new Error('保存するデータがありません');

      const { error } = await supabase.from('asset_snapshots').insert(insertData);
      if (error) throw error;

      alert('最新のスナップショットとして保存しました');
    } catch (err) {
      alert('エラー: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '24px', borderRadius: '24px', background: 'var(--card-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', background: 'rgba(0, 122, 255, 0.1)', borderRadius: '12px' }}>
            <Camera size={22} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>資産スナップショット</h2>
        </div>
        <button 
          onClick={fetchLatestSnapshot} 
          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}
        >
          <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
          最新を読込
        </button>
      </div>

      <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--divider)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
          <Calendar size={14} /> スナップショット日付
        </div>
        <input 
          type="date" 
          value={snapshotDate}
          onChange={(e) => setSnapshotDate(e.target.value)}
          style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', outline: 'none' }}
        />
      </div>

      {/* 銀行セクション */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
            <Building2 size={18} color="var(--primary)" /> 銀行・現金
          </div>
          <button onClick={addBankEntry} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={16} />
          </button>
        </div>
        {bankEntries.map((entry) => (
          <div key={entry.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input placeholder="名称" value={entry.name} onChange={(e) => updateBankEntry(entry.id, 'name', e.target.value)} className="input-field" style={{ flex: 1, margin: 0, padding: '10px 14px' }} />
            <input type="number" placeholder="金額" value={entry.amount} onChange={(e) => updateBankEntry(entry.id, 'amount', e.target.value)} className="input-field" style={{ width: '120px', margin: 0, padding: '10px 14px', textAlign: 'right', fontWeight: '600' }} />
            <button onClick={() => removeBankEntry(entry.id)} style={{ border: 'none', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}><X size={18} /></button>
          </div>
        ))}
      </div>

      {/* 株式セクション */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
            <TrendingUp size={18} color="#34C759" /> 株式・投資信託
          </div>
          <button onClick={addStockEntry} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: '#34C759', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={16} />
          </button>
        </div>
        {stockEntries.map((entry) => (
          <div key={entry.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input placeholder="銘柄名" value={entry.name} onChange={(e) => updateStockEntry(entry.id, 'name', e.target.value)} className="input-field" style={{ flex: 1, margin: 0, padding: '10px 14px' }} />
            <input type="number" placeholder="評価額" value={entry.amount} onChange={(e) => updateStockEntry(entry.id, 'amount', e.target.value)} className="input-field" style={{ width: '120px', margin: 0, padding: '10px 14px', textAlign: 'right', fontWeight: '600' }} />
            <button onClick={() => removeStockEntry(entry.id)} style={{ border: 'none', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer' }}><X size={18} /></button>
          </div>
        ))}
      </div>

      {/* 合計表示カード */}
      <div style={{ padding: '20px', background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)', borderRadius: '20px', marginBottom: '24px', color: 'white', boxShadow: '0 10px 30px rgba(0, 122, 255, 0.3)' }}>
        <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>Latest Total Assets</div>
        <div style={{ fontSize: '32px', fontWeight: '900' }}>¥{grandTotal.toLocaleString()}</div>
        <div style={{ display: 'flex', gap: '15px', marginTop: '12px', fontSize: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
          <span>銀行: ¥{totalBank.toLocaleString()}</span>
          <span>株式: ¥{totalStock.toLocaleString()}</span>
        </div>
      </div>

      <button 
        onClick={handleCreateSnapshot} 
        disabled={isLoading || grandTotal === 0}
        style={{
          width: '100%', padding: '18px', borderRadius: '16px', border: 'none', background: 'var(--text-main)',
          color: 'white', fontWeight: '700', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
        }}
      >
        {isLoading ? '保存中...' : <><Check size={20} /> 最新データとして同期・保存</>}
      </button>
    </div>
  );
}